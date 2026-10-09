/**
 * Atomberg Aura: Central State Management & IoT Logic Provider
 */

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  RoomId,
  RoomInfo,
  EnvironmentalReadings,
  FanState,
  FanSpeedLevel,
  FanMode,
  AutomationRule,
  ComfortDecision,
  ConnectedDevice,
  HistoryEvent,
  DemoScenario,
  EnvironmentalHistoryPoint,
} from '../types';
import {
  evaluateComfortEngine,
  FAN_AIRFLOW_RATES,
} from '../services/comfortEngine';
import { playTickSound, playStateChangeChime } from '../services/audio';

export const ROOMS_LIST: RoomInfo[] = [
  {
    id: 'living_room',
    name: 'Living Room',
    floor: 'Ground Floor',
    areaSqMeters: 28,
    sensorsInstalled: ['BME280 Ambient Temp/Humidity/Baro', 'PIR Occupancy Sensor'],
  },
  {
    id: 'master_bedroom',
    name: 'Master Bedroom',
    floor: 'First Floor',
    areaSqMeters: 22,
    sensorsInstalled: ['SHT40 Temp/Humidity', 'mmWave Radar Occupancy'],
  },
  {
    id: 'study_office',
    name: 'Home Office / Study',
    floor: 'First Floor',
    areaSqMeters: 14,
    sensorsInstalled: ['DHT22 Ambient Temp/Humidity', 'PIR Sensor'],
  },
  {
    id: 'dining_area',
    name: 'Dining Area',
    floor: 'Ground Floor',
    areaSqMeters: 18,
    sensorsInstalled: ['BME280 Ambient Sensor'],
  },
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'normal_room',
    name: '1. Normal Room Baseline',
    description: 'Balanced temperature (24.0°C) and moderate humidity (50% RH). Room is occupied.',
    temperatureC: 24.0,
    humidityPercent: 50,
    occupancy: true,
    temperatureTrend: 'stable',
    humidityTrend: 'stable',
    expectedFanAction: 'Maintain baseline comfort circulation (Level 2).',
    expectedExhaustAction: 'Exhaust fan remains OFF.',
  },
  {
    id: 'rising_temperature',
    name: '2. Rising Temperature',
    description: 'Sensible heat spikes to 31.2°C while occupied. Convective cooling required.',
    temperatureC: 31.2,
    humidityPercent: 52,
    occupancy: true,
    temperatureTrend: 'rising',
    humidityTrend: 'stable',
    expectedFanAction: 'Step up fan speed to Level 5 (220 m³/h) to dissipate thermal buildup.',
    expectedExhaustAction: 'Exhaust fan remains OFF.',
  },
  {
    id: 'high_humidity',
    name: '3. High Humidity Spike',
    description: 'Ambient humidity rises to 82% RH due to monsoonal weather or moisture accumulation.',
    temperatureC: 26.5,
    humidityPercent: 82,
    occupancy: true,
    temperatureTrend: 'stable',
    humidityTrend: 'rising',
    expectedFanAction: 'Maintain moderate airflow (Level 3-4).',
    expectedExhaustAction: 'Trigger auxiliary exhaust fan ON to evacuate damp air.',
  },
  {
    id: 'occupied_room',
    name: '4. Occupancy Detected',
    description: 'Human presence detected in room by PIR motion sensor.',
    temperatureC: 25.0,
    humidityPercent: 55,
    occupancy: true,
    temperatureTrend: 'stable',
    humidityTrend: 'stable',
    expectedFanAction: 'Resume preferred comfort curve (Level 3).',
    expectedExhaustAction: 'Exhaust fan in standby.',
  },
  {
    id: 'unoccupied_room',
    name: '5. Unoccupied Room (Eco)',
    description: 'Occupants have exited the room. PIR sensor confirms vacancy for over 15 minutes.',
    temperatureC: 27.5,
    humidityPercent: 58,
    occupancy: false,
    temperatureTrend: 'stable',
    humidityTrend: 'stable',
    expectedFanAction: 'Power OFF fan or drop to Eco Standby (Level 0/1) to conserve power.',
    expectedExhaustAction: 'Exhaust fan OFF.',
  },
  {
    id: 'return_comfort',
    name: '6. Return to Comfort',
    description: 'Conditions settle back to 23.8°C and 48% RH after thermal regulation.',
    temperatureC: 23.8,
    humidityPercent: 48,
    occupancy: true,
    temperatureTrend: 'falling',
    humidityTrend: 'falling',
    expectedFanAction: 'Gradually throttle fan back to Level 2 quiet operation.',
    expectedExhaustAction: 'Exhaust fan OFF.',
  },
];

export const INITIAL_RULES: AutomationRule[] = [
  {
    id: 'rule_temp_boost',
    name: 'Convective Heat Regulation',
    description: 'When room temperature exceeds 28.0°C, ramp up fan speed to Level 5.',
    enabled: true,
    trigger: 'temp_above',
    threshold: 28.0,
    unit: '°C',
    hysteresis: 0.8,
    targetDevice: 'smart_fan',
    action: 'set_fan_speed',
    actionValue: 5,
    cooldownSeconds: 20,
    lastTriggeredAt: null,
    executionCount: 0,
    executionStatus: 'idle',
  },
  {
    id: 'rule_humidity_exhaust',
    name: 'High Humidity Moisture Evacuation',
    description: 'When relative humidity exceeds 70%, trigger connected auxiliary exhaust fan.',
    enabled: true,
    trigger: 'humidity_above',
    threshold: 70,
    unit: '%',
    hysteresis: 3.0,
    targetDevice: 'exhaust_fan',
    action: 'turn_on_exhaust',
    cooldownSeconds: 30,
    lastTriggeredAt: null,
    executionCount: 0,
    executionStatus: 'idle',
  },
  {
    id: 'rule_comfort_recovery',
    name: 'Comfort Envelope Restoration',
    description: 'When temperature returns below 24.5°C, step fan speed down to quiet Level 2.',
    enabled: true,
    trigger: 'temp_below',
    threshold: 24.5,
    unit: '°C',
    hysteresis: 0.5,
    targetDevice: 'smart_fan',
    action: 'set_fan_speed',
    actionValue: 2,
    cooldownSeconds: 20,
    lastTriggeredAt: null,
    executionCount: 0,
    executionStatus: 'idle',
  },
  {
    id: 'rule_unoccupied_eco',
    name: 'Unoccupied Room Energy Saver',
    description: 'When room occupancy is vacant, shut down ceiling fan to save energy.',
    enabled: true,
    trigger: 'room_unoccupied',
    threshold: 0,
    unit: 'presence',
    hysteresis: 0,
    targetDevice: 'smart_fan',
    action: 'turn_off_fan',
    cooldownSeconds: 30,
    lastTriggeredAt: null,
    executionCount: 0,
    executionStatus: 'idle',
  },
];

export const INITIAL_DEVICES: ConnectedDevice[] = [
  {
    id: 'dev_fan_01',
    name: 'Atomberg Renesa+ Smart BLDC Fan',
    category: 'primary_fan',
    connectionType: 'BLE / Matter',
    status: 'demo_simulation',
    statusNote: 'Operating in Demo Simulation Mode. Physical hardware not connected.',
    model: 'Atomberg Renesa+ 1200mm (28W BLDC Motor)',
    powerDrawWatts: 15.2,
    lastHeartbeat: new Date().toISOString(),
    isOptional: false,
  },
  {
    id: 'dev_sensor_env',
    name: 'Bosch BME280 Ambient Sensor',
    category: 'sensor',
    connectionType: 'I2C / SPI',
    status: 'demo_simulation',
    statusNote: 'Simulated ambient temperature, humidity, and barometric atmospheric pressure.',
    model: 'BME280 Digital Combo Transducer',
    powerDrawWatts: 0.05,
    lastHeartbeat: new Date().toISOString(),
    isOptional: false,
  },
  {
    id: 'dev_sensor_pir',
    name: 'Passive Infrared (PIR) Motion Sensor',
    category: 'sensor',
    connectionType: 'PIR GPIO',
    status: 'demo_simulation',
    statusNote: 'Simulating room occupancy detection and motion telemetry.',
    model: 'HC-SR501 Wide-Angle Lens',
    powerDrawWatts: 0.01,
    lastHeartbeat: new Date().toISOString(),
    isOptional: true,
  },
  {
    id: 'dev_sensor_airflow',
    name: 'Thermal Anemometer Airflow Sensor',
    category: 'sensor',
    connectionType: 'I2C / SPI',
    status: 'disconnected',
    statusNote: 'Sensor not connected. Volumetric airflow is calculated from aerodynamic motor curves.',
    model: 'FS3000 Mass Velocity Sensor (Optional)',
    powerDrawWatts: 0,
    isOptional: true,
  },
  {
    id: 'dev_sensor_pressure_diff',
    name: 'Differential Pressure Transducer',
    category: 'sensor',
    connectionType: 'I2C / SPI',
    status: 'disconnected',
    statusNote: 'Sensor not connected. Note: BME280 reports barometric atmospheric pressure only.',
    model: 'SDP810 Differential Pitot (Optional)',
    powerDrawWatts: 0,
    isOptional: true,
  },
  {
    id: 'dev_exhaust_fan',
    name: 'Connected Auxiliary Exhaust Fan',
    category: 'auxiliary_actuator',
    connectionType: 'Dry Contact Relay',
    status: 'demo_simulation',
    statusNote: 'Simulated dry-contact relay for moisture evacuation.',
    model: 'Atomberg Studio Exhaust 150mm',
    powerDrawWatts: 0,
    lastHeartbeat: new Date().toISOString(),
    isOptional: true,
  },
  {
    id: 'dev_ac_gateway',
    name: 'Air Conditioner IR/Matter Gateway',
    category: 'auxiliary_actuator',
    connectionType: 'IR / Matter Gateway',
    status: 'not_configured',
    statusNote: 'Gateway not configured. Secondary HVAC coordination standby.',
    model: 'Smart IR Universal Blaster',
    powerDrawWatts: 0,
    isOptional: true,
  },
];

interface AuraContextValue {
  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // Room
  currentRoom: RoomId;
  setCurrentRoom: (room: RoomId) => void;
  roomInfo: RoomInfo;
  
  // Readings
  readings: EnvironmentalReadings;
  setManualReadings: (partial: Partial<EnvironmentalReadings>) => void;
  
  // Fan state
  fanState: FanState;
  setFanPower: (on: boolean) => void;
  setFanSpeed: (speed: FanSpeedLevel) => void;
  setFanMode: (mode: FanMode) => void;
  toggleOscillation: () => void;
  setSleepTimer: (minutes: number | null) => void;
  
  // Auxiliary devices
  exhaustFanPower: boolean;
  setExhaustFanPower: (on: boolean) => void;
  
  // Decision
  comfortDecision: ComfortDecision;
  decisionHistory: ComfortDecision[];
  forceReevaluateDecision: () => void;
  
  // Rules
  rules: AutomationRule[];
  toggleRule: (ruleId: string) => void;
  updateRule: (rule: AutomationRule) => void;
  addRule: (rule: Omit<AutomationRule, 'id' | 'executionCount' | 'executionStatus' | 'lastTriggeredAt'>) => void;
  deleteRule: (ruleId: string) => void;
  resetRulesToDefault: () => void;
  
  // Connected Devices
  devices: ConnectedDevice[];
  updateDeviceStatus: (deviceId: string, status: ConnectedDevice['status'], note?: string) => void;
  
  // Demo Mode
  demoMode: boolean;
  selectedScenario: DemoScenario | null;
  loadScenario: (scenarioId: string) => void;
  walkthroughStep: number;
  startWalkthrough: () => void;
  nextWalkthroughStep: () => void;
  resetWalkthrough: () => void;
  
  // Metrics & Timers
  activeSessionDurationSec: number;
  todayAccumulatedRuntimeSec: number;
  resetTodayRuntime: () => void;
  
  // History
  history: HistoryEvent[];
  clearHistory: () => void;
  exportHistoryCSV: () => void;
  exportHistoryJSON: () => void;
  
  // Environment chart series
  historyChartData: EnvironmentalHistoryPoint[];
  
  // Preferences
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Hardware test modal
  showHardwareModal: boolean;
  setShowHardwareModal: (open: boolean) => void;
  showLaunchAuditModal: boolean;
  setShowLaunchAuditModal: (open: boolean) => void;
}

const AuraContext = createContext<AuraContextValue | undefined>(undefined);

export const AuraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentRoom, setCurrentRoom] = useState<RoomId>('living_room');

  // Preferences
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [showHardwareModal, setShowHardwareModal] = useState<boolean>(false);
  const [showLaunchAuditModal, setShowLaunchAuditModal] = useState<boolean>(false);

  // Demo Walkthrough
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(DEMO_SCENARIOS[0]);
  const [walkthroughStep, setWalkthroughStep] = useState<number>(0);

  // Auxiliary
  const [exhaustFanPower, setExhaustFanPower] = useState<boolean>(false);

  // Rules
  const [rules, setRules] = useState<AutomationRule[]>(() => {
    try {
      const saved = localStorage.getItem('aura_automation_rules');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_RULES;
  });

  // Devices
  const [devices, setDevices] = useState<ConnectedDevice[]>(INITIAL_DEVICES);

  // Environmental Readings
  const [readings, setReadings] = useState<EnvironmentalReadings>({
    temperatureC: 24.0,
    humidityPercent: 50,
    occupancy: true,
    occupancySensorAvailable: true,
    temperatureTrend: 'stable',
    temperatureTrendRate: 0.1,
    humidityTrend: 'stable',
    humidityTrendRate: 0.0,
    timestamp: new Date().toISOString(),
    dataSource: 'demo_simulation',
  });

  // Fan State
  const [fanState, setFanState] = useState<FanState>({
    requestedPower: true,
    confirmedPower: true,
    requestedSpeed: 2,
    confirmedSpeed: 2,
    mode: 'auto_comfort',
    oscillation: false,
    sleepTimerMinutes: null,
    lastStateChange: new Date().toISOString(),
    isHardwareSynced: true,
  });

  // Active timers
  const [activeSessionDurationSec, setActiveSessionDurationSec] = useState<number>(1420); // starts with existing session
  const [todayAccumulatedRuntimeSec, setTodayAccumulatedRuntimeSec] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aura_today_runtime_sec');
      if (saved) return parseInt(saved, 10);
    } catch {
      // Ignore
    }
    return 7980; // ~2h 13m baseline
  });

  // Decisions
  const lastDecisionTimestampRef = useRef<number>(Date.now() - 30000);
  const [comfortDecision, setComfortDecision] = useState<ComfortDecision>({
    id: 'dec_init',
    timestamp: new Date().toISOString(),
    inputsConsidered: {
      temperatureC: 24.0,
      humidityPercent: 50,
      occupancy: true,
      tempTrend: 'stable',
      apparentTempC: 23.6,
      comfortCategory: 'Comfortable',
    },
    triggeredRuleId: null,
    ruleName: 'ASHRAE Baseline Comfort Curve',
    decisionMade: 'Sensible temperature is within nominal comfort bounds (24.0°C).',
    requestedAction: 'Maintain Level 2 quiet air circulation.',
    confirmedResult: 'Applied: Fan Power ON @ Speed Level 2',
    plainLanguageExplanation: 'Conditions are comfortably balanced. The comfort engine maintains a gentle air displacement to prevent room air stagnation.',
    antiCyclingProtected: false,
  });
  const [decisionHistory, setDecisionHistory] = useState<ComfortDecision[]>([]);

  // History Log
  const [history, setHistory] = useState<HistoryEvent[]>(() => {
    try {
      const saved = localStorage.getItem('aura_history_log');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [
      {
        id: 'hist_1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        eventType: 'demo_scenario',
        roomName: 'Living Room',
        temperatureC: 24.0,
        humidityPercent: 50,
        occupancy: true,
        ruleName: 'ASHRAE Baseline Comfort Curve',
        requestedAction: 'Engage Fan Level 2',
        confirmedResult: 'Simulated fan speed updated to Level 2',
        triggeredBy: 'Demo Scenario: Normal Room',
      },
    ];
  });

  // Simulated 24-hour environmental trend chart data
  const historyChartData = useMemo<EnvironmentalHistoryPoint[]>(() => {
    const points: EnvironmentalHistoryPoint[] = [];
    const baseTemp = readings.temperatureC;
    const baseHumidity = readings.humidityPercent;
    for (let i = 24; i >= 0; i--) {
      const time = new Date(Date.now() - i * 3600000);
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Natural diurnal variation curve
      const offset = Math.sin((24 - i) / 3.8) * 2.2;
      points.push({
        timestamp: timeStr,
        temperatureC: Math.round((baseTemp + offset) * 10) / 10,
        humidityPercent: Math.round(baseHumidity - offset * 1.5),
        fanSpeed: (offset > 1.0 ? 4 : offset < -0.5 ? 1 : 2) as FanSpeedLevel,
      });
    }
    return points;
  }, [readings.temperatureC, readings.humidityPercent]);

  // Persist rules & history
  useEffect(() => {
    try {
      localStorage.setItem('aura_automation_rules', JSON.stringify(rules));
    } catch {}
  }, [rules]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_history_log', JSON.stringify(history.slice(0, 100)));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_today_runtime_sec', todayAccumulatedRuntimeSec.toString());
    } catch {}
  }, [todayAccumulatedRuntimeSec]);

  // Fan runtime tick (when fan is confirmed ON)
  useEffect(() => {
    if (!fanState.confirmedPower || fanState.confirmedSpeed === 0) return;
    const timer = setInterval(() => {
      setActiveSessionDurationSec((prev) => prev + 1);
      setTodayAccumulatedRuntimeSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [fanState.confirmedPower, fanState.confirmedSpeed]);

  // Central Evaluation Function
  const runEvaluation = useCallback(
    (currentReadings: EnvironmentalReadings, currentFan: FanState) => {
      if (currentFan.mode === 'manual') {
        return; // In manual mode, engine does not override fan speed
      }

      const evalResult = evaluateComfortEngine(
        currentReadings,
        currentFan,
        rules,
        lastDecisionTimestampRef.current
      );

      setComfortDecision(evalResult.decision);
      setDecisionHistory((prev) => [evalResult.decision, ...prev.slice(0, 19)]);
      lastDecisionTimestampRef.current = Date.now();

      // Apply recommended fan changes
      if (evalResult.recommendedFanPower !== currentFan.confirmedPower || evalResult.recommendedFanSpeed !== currentFan.confirmedSpeed) {
        setFanState((prev) => ({
          ...prev,
          requestedPower: evalResult.recommendedFanPower,
          confirmedPower: evalResult.recommendedFanPower,
          requestedSpeed: evalResult.recommendedFanSpeed,
          confirmedSpeed: evalResult.recommendedFanSpeed,
          lastStateChange: new Date().toISOString(),
        }));
        playStateChangeChime(soundEnabled);
      }

      // Apply recommended exhaust changes
      if (evalResult.recommendedExhaustPower !== exhaustFanPower) {
        setExhaustFanPower(evalResult.recommendedExhaustPower);
      }

      // Record to history if active rule triggered
      if (evalResult.activeRuleTriggered) {
        const newHist: HistoryEvent = {
          id: `hist_${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'automatic_rule',
          roomName: ROOMS_LIST.find((r) => r.id === currentRoom)?.name || 'Living Room',
          temperatureC: currentReadings.temperatureC,
          humidityPercent: currentReadings.humidityPercent,
          occupancy: currentReadings.occupancy,
          ruleName: evalResult.decision.ruleName,
          requestedAction: evalResult.decision.requestedAction,
          confirmedResult: evalResult.decision.confirmedResult,
          triggeredBy: `Auto Comfort Engine (${evalResult.decision.ruleName})`,
        };
        setHistory((prev) => [newHist, ...prev.slice(0, 99)]);
      }
    },
    [rules, soundEnabled, exhaustFanPower, currentRoom]
  );

  // Fan Controls
  const setFanPower = useCallback(
    (on: boolean) => {
      playTickSound(soundEnabled);
      setFanState((prev) => ({
        ...prev,
        requestedPower: on,
        confirmedPower: on,
        confirmedSpeed: on && prev.confirmedSpeed === 0 ? 2 : on ? prev.confirmedSpeed : 0,
        requestedSpeed: on && prev.requestedSpeed === 0 ? 2 : on ? prev.requestedSpeed : 0,
        lastStateChange: new Date().toISOString(),
      }));

      if (!on) {
        setActiveSessionDurationSec(0);
      }

      const logEvent: HistoryEvent = {
        id: `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'manual_control',
        roomName: ROOMS_LIST.find((r) => r.id === currentRoom)?.name || 'Living Room',
        temperatureC: readings.temperatureC,
        humidityPercent: readings.humidityPercent,
        occupancy: readings.occupancy,
        requestedAction: `Turn Fan ${on ? 'ON' : 'OFF'}`,
        confirmedResult: `Fan Power set to ${on ? 'ON' : 'OFF'}`,
        triggeredBy: 'Manual User Action',
      };
      setHistory((prev) => [logEvent, ...prev.slice(0, 99)]);
    },
    [soundEnabled, currentRoom, readings]
  );

  const setFanSpeed = useCallback(
    (speed: FanSpeedLevel) => {
      playTickSound(soundEnabled);
      const isPowerOn = speed > 0;
      setFanState((prev) => ({
        ...prev,
        requestedPower: isPowerOn,
        confirmedPower: isPowerOn,
        requestedSpeed: speed,
        confirmedSpeed: speed,
        lastStateChange: new Date().toISOString(),
      }));

      const logEvent: HistoryEvent = {
        id: `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'manual_control',
        roomName: ROOMS_LIST.find((r) => r.id === currentRoom)?.name || 'Living Room',
        temperatureC: readings.temperatureC,
        humidityPercent: readings.humidityPercent,
        occupancy: readings.occupancy,
        requestedAction: `Set fan speed to Level ${speed} (${FAN_AIRFLOW_RATES[speed]} m³/h)`,
        confirmedResult: `Confirmed hardware speed Level ${speed}`,
        triggeredBy: 'Manual User Action',
      };
      setHistory((prev) => [logEvent, ...prev.slice(0, 99)]);
    },
    [soundEnabled, currentRoom, readings]
  );

  const setFanMode = useCallback(
    (mode: FanMode) => {
      playTickSound(soundEnabled);
      setFanState((prev) => ({ ...prev, mode }));
      if (mode === 'auto_comfort') {
        // Trigger auto evaluation
        runEvaluation(readings, { ...fanState, mode });
      }
    },
    [soundEnabled, readings, fanState, runEvaluation]
  );

  const toggleOscillation = useCallback(() => {
    playTickSound(soundEnabled);
    setFanState((prev) => ({ ...prev, oscillation: !prev.oscillation }));
  }, [soundEnabled]);

  const setSleepTimer = useCallback(
    (minutes: number | null) => {
      playTickSound(soundEnabled);
      setFanState((prev) => ({ ...prev, sleepTimerMinutes: minutes }));
    },
    [soundEnabled]
  );

  const setManualReadings = useCallback(
    (partial: Partial<EnvironmentalReadings>) => {
      setReadings((prev) => {
        const updated = { ...prev, ...partial, timestamp: new Date().toISOString() };
        if (fanState.mode === 'auto_comfort') {
          runEvaluation(updated, fanState);
        }
        return updated;
      });
    },
    [fanState, runEvaluation]
  );

  // Load a demo scenario deterministically
  const loadScenario = useCallback(
    (scenarioId: string) => {
      const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId) || DEMO_SCENARIOS[0];
      setSelectedScenario(scenario);
      playTickSound(soundEnabled);

      const newReadings: EnvironmentalReadings = {
        temperatureC: scenario.temperatureC,
        humidityPercent: scenario.humidityPercent,
        occupancy: scenario.occupancy,
        occupancySensorAvailable: true,
        temperatureTrend: scenario.temperatureTrend,
        temperatureTrendRate: scenario.temperatureTrend === 'rising' ? 1.4 : scenario.temperatureTrend === 'falling' ? -1.1 : 0.0,
        humidityTrend: scenario.humidityTrend,
        humidityTrendRate: scenario.humidityTrend === 'rising' ? 4.5 : scenario.humidityTrend === 'falling' ? -3.0 : 0.0,
        timestamp: new Date().toISOString(),
        dataSource: 'demo_simulation',
      };

      setReadings(newReadings);

      // Force evaluate with zero anti-cycling delay for demo responsiveness
      const evalResult = evaluateComfortEngine(newReadings, fanState, rules, 0, 0);
      setComfortDecision(evalResult.decision);
      lastDecisionTimestampRef.current = Date.now();

      if (fanState.mode === 'auto_comfort') {
        setFanState((prev) => ({
          ...prev,
          requestedPower: evalResult.recommendedFanPower,
          confirmedPower: evalResult.recommendedFanPower,
          requestedSpeed: evalResult.recommendedFanSpeed,
          confirmedSpeed: evalResult.recommendedFanSpeed,
          lastStateChange: new Date().toISOString(),
        }));
        setExhaustFanPower(evalResult.recommendedExhaustPower);
      }

      // Log event
      const logEvent: HistoryEvent = {
        id: `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'demo_scenario',
        roomName: ROOMS_LIST.find((r) => r.id === currentRoom)?.name || 'Living Room',
        temperatureC: scenario.temperatureC,
        humidityPercent: scenario.humidityPercent,
        occupancy: scenario.occupancy,
        ruleName: evalResult.decision.ruleName,
        requestedAction: evalResult.decision.requestedAction,
        confirmedResult: evalResult.decision.confirmedResult,
        triggeredBy: `Demo Scenario: ${scenario.name}`,
      };
      setHistory((prev) => [logEvent, ...prev.slice(0, 99)]);
    },
    [soundEnabled, fanState, rules, currentRoom]
  );

  // Hackathon 9-Step Walkthrough sequence as mandated by Section 7
  // Step 1: Normal conditions
  // Step 2: Rising Temperature
  // Step 3: Update simulated readings
  // Step 4: Show comfort engine explanation
  // Step 5: Increase simulated fan speed
  // Step 6: Select High Humidity
  // Step 7: Show configured exhaust-device response
  // Step 8: Return to normal conditions
  // Step 9: Display recorded events in History
  const startWalkthrough = useCallback(() => {
    setWalkthroughStep(1);
    loadScenario('normal_room');
  }, [loadScenario]);

  const nextWalkthroughStep = useCallback(() => {
    setWalkthroughStep((prev) => {
      const next = prev + 1;
      if (next === 2) {
        // Step 2: Select Rising Temperature
        loadScenario('rising_temperature');
      } else if (next === 3) {
        // Step 3: Update simulated readings (already updated by loadScenario, highlighted in UI)
      } else if (next === 4) {
        // Step 4: Show comfort engine explanation (navigate/focus on AI Comfort panel)
      } else if (next === 5) {
        // Step 5: Increase simulated fan speed (confirmed at level 5)
      } else if (next === 6) {
        // Step 6: Select High Humidity
        loadScenario('high_humidity');
      } else if (next === 7) {
        // Step 7: Show configured exhaust-device response (exhaust fan active)
      } else if (next === 8) {
        // Step 8: Return to normal conditions
        loadScenario('return_comfort');
      } else if (next === 9) {
        // Step 9: Display recorded events in History
        setCurrentView('history');
      } else {
        return 0; // finished
      }
      return next;
    });
  }, [loadScenario]);

  const resetWalkthrough = useCallback(() => {
    setWalkthroughStep(0);
    loadScenario('normal_room');
  }, [loadScenario]);

  // Rule management
  const toggleRule = useCallback((ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const updateRule = useCallback((updated: AutomationRule) => {
    setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  const addRule = useCallback(
    (ruleData: Omit<AutomationRule, 'id' | 'executionCount' | 'executionStatus' | 'lastTriggeredAt'>) => {
      const newRule: AutomationRule = {
        ...ruleData,
        id: `rule_${Date.now()}`,
        executionCount: 0,
        executionStatus: 'idle',
        lastTriggeredAt: null,
      };
      setRules((prev) => [...prev, newRule]);
    },
    []
  );

  const deleteRule = useCallback((ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  }, []);

  const resetRulesToDefault = useCallback(() => {
    setRules(INITIAL_RULES);
  }, []);

  const updateDeviceStatus = useCallback(
    (deviceId: string, status: ConnectedDevice['status'], note?: string) => {
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status, statusNote: note || d.statusNote } : d))
      );
    },
    []
  );

  const resetTodayRuntime = useCallback(() => {
    setTodayAccumulatedRuntimeSec(0);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const exportHistoryCSV = useCallback(() => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Room', 'Event Type', 'Temperature (°C)', 'Humidity (%)', 'Occupancy', 'Rule Name', 'Requested Action', 'Confirmed Result', 'Triggered By'];
    const rows = history.map((h) => [
      `"${h.timestamp}"`,
      `"${h.roomName}"`,
      `"${h.eventType}"`,
      h.temperatureC.toFixed(1),
      h.humidityPercent.toString(),
      h.occupancy === null ? 'N/A' : h.occupancy ? 'Occupied' : 'Unoccupied',
      `"${h.ruleName || ''}"`,
      `"${h.requestedAction.replace(/"/g, '""')}"`,
      `"${h.confirmedResult.replace(/"/g, '""')}"`,
      `"${h.triggeredBy.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atomberg_aura_audit_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [history]);

  const exportHistoryJSON = useCallback(() => {
    if (history.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `atomberg_aura_audit_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [history]);

  const forceReevaluateDecision = useCallback(() => {
    runEvaluation(readings, fanState);
  }, [readings, fanState, runEvaluation]);

  const roomInfo = useMemo(() => {
    return ROOMS_LIST.find((r) => r.id === currentRoom) || ROOMS_LIST[0];
  }, [currentRoom]);

  const contextValue: AuraContextValue = {
    currentView,
    setCurrentView,
    currentRoom,
    setCurrentRoom,
    roomInfo,
    readings,
    setManualReadings,
    fanState,
    setFanPower,
    setFanSpeed,
    setFanMode,
    toggleOscillation,
    setSleepTimer,
    exhaustFanPower,
    setExhaustFanPower,
    comfortDecision,
    decisionHistory,
    forceReevaluateDecision,
    rules,
    toggleRule,
    updateRule,
    addRule,
    deleteRule,
    resetRulesToDefault,
    devices,
    updateDeviceStatus,
    demoMode,
    selectedScenario,
    loadScenario,
    walkthroughStep,
    startWalkthrough,
    nextWalkthroughStep,
    resetWalkthrough,
    activeSessionDurationSec,
    todayAccumulatedRuntimeSec,
    resetTodayRuntime,
    history,
    clearHistory,
    exportHistoryCSV,
    exportHistoryJSON,
    historyChartData,
    tempUnit,
    setTempUnit,
    soundEnabled,
    setSoundEnabled,
    showHardwareModal,
    setShowHardwareModal,
    showLaunchAuditModal,
    setShowLaunchAuditModal,
  };

  return <AuraContext.Provider value={contextValue}>{children}</AuraContext.Provider>;
};

export function useAura(): AuraContextValue {
  const context = useContext(AuraContext);
  if (!context) {
    throw new Error('useAura must be used within an AuraProvider');
  }
  return context;
}
