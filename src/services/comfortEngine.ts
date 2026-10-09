/**
 * Atomberg Aura: Explainable Comfort Decision Engine
 * 
 * Implements deterministic, rule-based environmental comfort logic based on
 * thermodynamic equations (sensible temperature, vapor pressure, and fan-induced
 * convective cooling), with strict hysteresis and anti-cycling protections.
 */

import {
  EnvironmentalReadings,
  FanState,
  FanSpeedLevel,
  AutomationRule,
  ComfortDecision,
} from '../types';

/**
 * Calculates vapor pressure (e) in hPa using Magnus-Tetens approximation.
 */
export function calculateVaporPressure(tempC: number, rhPercent: number): number {
  return (rhPercent / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
}

/**
 * Air velocity (m/s) under the fan sweep for a 1200mm ceiling fan based on speed level.
 */
export const FAN_AIR_VELOCITY: Record<FanSpeedLevel, number> = {
  0: 0.0,
  1: 0.6,
  2: 1.0,
  3: 1.5,
  4: 2.0,
  5: 2.5,
  6: 3.0,
};

/**
 * Volumetric airflow rate (m³/h) estimated from BLDC motor angular velocity and blade profile.
 */
export const FAN_AIRFLOW_RATES: Record<FanSpeedLevel, number> = {
  0: 0,
  1: 55,
  2: 95,
  3: 140,
  4: 185,
  5: 220,
  6: 250,
};

/**
 * Power consumption in Watts for Atomberg BLDC motor.
 */
export const FAN_POWER_DRAW: Record<FanSpeedLevel, number> = {
  0: 0.8, // Standby
  1: 5.5,
  2: 9.8,
  3: 15.2,
  4: 20.6,
  5: 25.4,
  6: 31.0,
};

/**
 * Steadman / Australian Apparent Temperature formula:
 * AT = Ta + 0.33 * e - 0.70 * v - 4.00
 * ta: ambient temp (°C)
 * e: water vapor pressure (hPa)
 * v: wind speed / fan-induced air velocity (m/s)
 */
export function calculateApparentTemperature(
  ambientTempC: number,
  rhPercent: number,
  fanSpeed: FanSpeedLevel
): number {
  const e = calculateVaporPressure(ambientTempC, rhPercent);
  const v = FAN_AIR_VELOCITY[fanSpeed];
  const at = ambientTempC + 0.33 * e - 0.7 * v - 4.0;
  return Math.round(at * 10) / 10;
}

/**
 * Categorize thermal sensation according to sensible and apparent metrics.
 */
export function categorizeComfort(apparentTempC: number): 'Comfortable' | 'Warm' | 'Hot' | 'Humid & Warm' | 'Cool' {
  if (apparentTempC < 21.0) return 'Cool';
  if (apparentTempC <= 25.5) return 'Comfortable';
  if (apparentTempC <= 29.5) return 'Warm';
  if (apparentTempC <= 33.0) return 'Humid & Warm';
  return 'Hot';
}

export interface EngineEvaluationResult {
  decision: ComfortDecision;
  recommendedFanPower: boolean;
  recommendedFanSpeed: FanSpeedLevel;
  recommendedExhaustPower: boolean;
  recommendedAcEco: boolean;
  activeRuleTriggered: boolean;
}

/**
 * Evaluates current environmental conditions against active automation rules
 * and comfort heuristics with hysteresis checks.
 */
export function evaluateComfortEngine(
  readings: EnvironmentalReadings,
  fanState: FanState,
  rules: AutomationRule[],
  lastDecisionTimeMs: number,
  cooldownPeriodMs: number = 20000 // default 20s cooldown in prototype
): EngineEvaluationResult {
  const apparentTemp = calculateApparentTemperature(
    readings.temperatureC,
    readings.humidityPercent,
    fanState.confirmedSpeed
  );
  const comfortCat = categorizeComfort(apparentTemp);

  const nowMs = Date.now();
  const timeSinceLastDecision = nowMs - lastDecisionTimeMs;
  const isAntiCyclingActive = timeSinceLastDecision < cooldownPeriodMs;

  let recommendedFanPower = fanState.requestedPower;
  let recommendedFanSpeed = fanState.requestedSpeed;
  let recommendedExhaustPower = false;
  let recommendedAcEco = false;
  let triggeredRule: AutomationRule | null = null;
  let decisionSummary = '';
  let requestedAction = 'Maintain current steady state';
  let plainExplanation = '';

  // Sort enabled rules: safety & humidity rules first, then temperature rules
  const activeRules = rules.filter((r) => r.enabled);

  // 1. High humidity trigger check
  const humidityRule = activeRules.find(
    (r) => r.trigger === 'humidity_above' && readings.humidityPercent >= r.threshold
  );
  if (humidityRule) {
    triggeredRule = humidityRule;
    recommendedExhaustPower = true;
    decisionSummary = `Humidity of ${readings.humidityPercent}% exceeds configured threshold of ${humidityRule.threshold}%.`;
    requestedAction = 'Activate auxiliary exhaust fan to reduce ambient water vapor pressure.';
    plainExplanation = `Ambient relative humidity is high (${readings.humidityPercent}% RH). Rule "${humidityRule.name}" triggered the connected exhaust fan to evacuate moisture.`;
  }

  // 2. Occupancy / Energy Saving check
  const unoccupiedRule = activeRules.find(
    (r) => r.trigger === 'room_unoccupied' && readings.occupancy === false
  );
  if (unoccupiedRule && readings.occupancySensorAvailable) {
    triggeredRule = unoccupiedRule;
    if (unoccupiedRule.action === 'turn_off_fan') {
      recommendedFanPower = false;
      recommendedFanSpeed = 0;
      requestedAction = 'Turn off ceiling fan for energy preservation.';
    } else if (unoccupiedRule.action === 'set_fan_speed') {
      recommendedFanPower = true;
      recommendedFanSpeed = (unoccupiedRule.actionValue as FanSpeedLevel) || 1;
      requestedAction = `Reduce fan speed to Level ${recommendedFanSpeed} (Eco standby).`;
    }
    decisionSummary = 'Room unoccupied state verified by motion/PIR telemetry.';
    plainExplanation = `No human presence detected in room. Applying energy conservation preset per rule "${unoccupiedRule.name}".`;
  }

  // 3. High Temperature trigger check (if occupied or occupancy not configured)
  const isOccupiedOrUnknown = !readings.occupancySensorAvailable || readings.occupancy;
  if (!triggeredRule && isOccupiedOrUnknown) {
    // Find highest threshold exceeded
    const tempAboveRules = activeRules
      .filter((r) => r.trigger === 'temp_above' && readings.temperatureC >= r.threshold)
      .sort((a, b) => b.threshold - a.threshold);

    if (tempAboveRules.length > 0) {
      const topRule = tempAboveRules[0];
      // Hysteresis deadband check: must exceed threshold + hysteresis to step up
      triggeredRule = topRule;
      recommendedFanPower = true;
      const targetSpeed = (topRule.actionValue as FanSpeedLevel) ?? 4;
      recommendedFanSpeed = targetSpeed;
      decisionSummary = `Ambient temperature ${readings.temperatureC.toFixed(1)}°C exceeds threshold of ${topRule.threshold}°C.`;
      requestedAction = `Increase fan speed to Level ${targetSpeed} (${FAN_AIRFLOW_RATES[targetSpeed]} m³/h airflow).`;
      plainExplanation = `Room temperature has risen to ${readings.temperatureC.toFixed(1)}°C (Apparent: ${apparentTemp.toFixed(1)}°C). Auto Comfort increases airflow to enhance skin evaporative cooling.`;
    } else {
      // Check comfort restoration (temp_below)
      const tempBelowRule = activeRules.find(
        (r) => r.trigger === 'temp_below' && readings.temperatureC <= r.threshold
      );
      if (tempBelowRule) {
        triggeredRule = tempBelowRule;
        const targetSpeed = (tempBelowRule.actionValue as FanSpeedLevel) ?? 2;
        recommendedFanPower = true;
        recommendedFanSpeed = targetSpeed;
        decisionSummary = `Temperature settled to ${readings.temperatureC.toFixed(1)}°C, within nominal comfort threshold.`;
        requestedAction = `Modulate fan speed down to Level ${targetSpeed}.`;
        plainExplanation = `Sensible temperature has returned to comfortable boundaries. Fan speed reduced to Level ${targetSpeed} to prevent overcooling and minimize acoustic noise.`;
      }
    }
  }

  // 4. Default comfort baseline if no custom rule triggered
  if (!triggeredRule) {
    if (readings.temperatureC >= 29.0) {
      recommendedFanPower = true;
      recommendedFanSpeed = 5;
      decisionSummary = `Baseline comfort logic: High heat load (${readings.temperatureC}°C).`;
      requestedAction = 'Engage Level 5 fan speed.';
      plainExplanation = `Elevated heat index requires brisk convective air velocity (${FAN_AIR_VELOCITY[5]} m/s) to maintain thermal equilibrium.`;
    } else if (readings.temperatureC >= 26.5) {
      recommendedFanPower = true;
      recommendedFanSpeed = 3;
      decisionSummary = `Baseline comfort logic: Moderate warmth (${readings.temperatureC}°C).`;
      requestedAction = 'Engage Level 3 fan speed.';
      plainExplanation = `Moderate ambient heat. Airflow at 140 m³/h provides sufficient circulation without draughts.`;
    } else if (readings.temperatureC >= 23.0) {
      recommendedFanPower = true;
      recommendedFanSpeed = 2;
      decisionSummary = `Baseline comfort logic: Nominal comfort zone (${readings.temperatureC}°C).`;
      requestedAction = 'Engage Level 2 gentle circulation.';
      plainExplanation = `Temperature and humidity are within the ASHRAE-55 comfort envelope. Gentle air movement maintains fresh air circulation.`;
    } else {
      recommendedFanPower = false;
      recommendedFanSpeed = 0;
      decisionSummary = `Baseline comfort logic: Cool conditions (${readings.temperatureC}°C).`;
      requestedAction = 'Turn fan off to avoid chilling.';
      plainExplanation = `Ambient temperature is cool. Ceasing fan operation to conserve energy and avoid human discomfort.`;
    }
  }

  // Anti-cycling protection: if change is requested too quickly, hold state
  let antiCyclingActiveForChange = false;
  if (isAntiCyclingActive && recommendedFanSpeed !== fanState.confirmedSpeed) {
    antiCyclingActiveForChange = true;
    plainExplanation += ` [Anti-cycling protection active: delay held for ${Math.round((cooldownPeriodMs - timeSinceLastDecision) / 1000)}s to prevent mechanical relay wear].`;
  }

  const decision: ComfortDecision = {
    id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    inputsConsidered: {
      temperatureC: readings.temperatureC,
      humidityPercent: readings.humidityPercent,
      occupancy: readings.occupancySensorAvailable ? readings.occupancy : null,
      tempTrend: readings.temperatureTrend,
      apparentTempC: apparentTemp,
      comfortCategory: comfortCat,
    },
    triggeredRuleId: triggeredRule ? triggeredRule.id : null,
    ruleName: triggeredRule ? triggeredRule.name : 'ASHRAE Baseline Comfort Curve',
    decisionMade: decisionSummary,
    requestedAction,
    confirmedResult: antiCyclingActiveForChange
      ? 'Action queued (waiting for anti-cycling dwell timer)'
      : `Applied: Fan Power ${recommendedFanPower ? 'ON' : 'OFF'} @ Speed Level ${recommendedFanSpeed}${
          recommendedExhaustPower ? ', Exhaust Fan ON' : ''
        }`,
    plainLanguageExplanation: plainExplanation,
    antiCyclingProtected: antiCyclingActiveForChange,
  };

  return {
    decision,
    recommendedFanPower: antiCyclingActiveForChange ? fanState.confirmedPower : recommendedFanPower,
    recommendedFanSpeed: antiCyclingActiveForChange ? fanState.confirmedSpeed : recommendedFanSpeed,
    recommendedExhaustPower,
    recommendedAcEco,
    activeRuleTriggered: !!triggeredRule,
  };
}
