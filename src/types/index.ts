/**
 * Atomberg Aura: Intelligent Comfort Control
 * Core TypeScript Type Definitions
 */

export type RoomId = 'living_room' | 'master_bedroom' | 'study_office' | 'dining_area';

export interface RoomInfo {
  id: RoomId;
  name: string;
  floor: string;
  areaSqMeters: number;
  sensorsInstalled: string[];
}

export type TrendDirection = 'rising' | 'falling' | 'stable';

export type SensorDataSource = 'live_hardware' | 'demo_simulation' | 'calculated_estimate' | 'unavailable';

export interface EnvironmentalReadings {
  temperatureC: number;
  humidityPercent: number;
  occupancy: boolean;
  occupancySensorAvailable: boolean;
  temperatureTrend: TrendDirection;
  temperatureTrendRate: number; // °C per hour
  humidityTrend: TrendDirection;
  humidityTrendRate: number; // %RH per hour
  timestamp: string;
  dataSource: SensorDataSource;
}

export type FanMode = 'manual' | 'auto_comfort';

export type FanSpeedLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface FanState {
  requestedPower: boolean;
  confirmedPower: boolean;
  requestedSpeed: FanSpeedLevel;
  confirmedSpeed: FanSpeedLevel;
  mode: FanMode;
  oscillation: boolean;
  sleepTimerMinutes: number | null;
  lastStateChange: string;
  isHardwareSynced: boolean;
}

export interface MetricData {
  title: string;
  value: string;
  unit: string;
  trendText?: string;
  trendDirection?: TrendDirection;
  status: 'live' | 'simulated' | 'estimated' | 'sensor_disconnected';
  statusExplanation: string;
}

export interface ComfortDecision {
  id: string;
  timestamp: string;
  inputsConsidered: {
    temperatureC: number;
    humidityPercent: number;
    occupancy: boolean | null;
    tempTrend: TrendDirection;
    apparentTempC: number;
    comfortCategory: 'Comfortable' | 'Warm' | 'Hot' | 'Humid & Warm' | 'Cool';
  };
  triggeredRuleId: string | null;
  ruleName: string;
  decisionMade: string;
  requestedAction: string;
  confirmedResult: string;
  plainLanguageExplanation: string;
  antiCyclingProtected: boolean;
}

export type AutomationTrigger =
  | 'temp_above'
  | 'temp_below'
  | 'humidity_above'
  | 'humidity_below'
  | 'room_occupied'
  | 'room_unoccupied'
  | 'temp_trend_rising';

export type TargetDevice = 'smart_fan' | 'exhaust_fan' | 'air_conditioner';

export type AutomationAction =
  | 'set_fan_speed'
  | 'increase_fan_speed'
  | 'decrease_fan_speed'
  | 'turn_off_fan'
  | 'turn_on_exhaust'
  | 'turn_off_exhaust'
  | 'set_ac_eco';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  threshold: number;
  unit: string;
  hysteresis: number; // Deadband to prevent oscillation
  targetDevice: TargetDevice;
  action: AutomationAction;
  actionValue?: number | string;
  cooldownSeconds: number; // Anti-cycling delay
  lastTriggeredAt: string | null;
  executionCount: number;
  executionStatus: 'idle' | 'triggered' | 'cooldown_active' | 'disabled';
}

export type DeviceConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'not_configured'
  | 'demo_simulation'
  | 'not_responding';

export interface ConnectedDevice {
  id: string;
  name: string;
  category: 'primary_fan' | 'sensor' | 'auxiliary_actuator';
  connectionType: 'BLE / Matter' | 'I2C / SPI' | 'PIR GPIO' | 'Dry Contact Relay' | 'IR / Matter Gateway';
  status: DeviceConnectionStatus;
  statusNote: string;
  model: string;
  powerDrawWatts?: number;
  lastHeartbeat?: string;
  isOptional: boolean;
}

export interface HistoryEvent {
  id: string;
  timestamp: string;
  eventType: 'automatic_rule' | 'manual_control' | 'demo_scenario' | 'safety_override';
  roomName: string;
  temperatureC: number;
  humidityPercent: number;
  occupancy: boolean | null;
  ruleName?: string;
  requestedAction: string;
  confirmedResult: string;
  triggeredBy: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  temperatureC: number;
  humidityPercent: number;
  occupancy: boolean;
  temperatureTrend: TrendDirection;
  humidityTrend: TrendDirection;
  expectedFanAction: string;
  expectedExhaustAction: string;
}

export interface EnvironmentalHistoryPoint {
  timestamp: string;
  temperatureC: number;
  humidityPercent: number;
  fanSpeed: FanSpeedLevel;
}
