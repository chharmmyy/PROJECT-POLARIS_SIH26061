import random
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from ..config import SFC_POINTS, DIESEL_CO2_FACTOR, CRITICAL_LOAD_FRACTION

def sfc_curve(loading_pct: float) -> float:
    """Specific Fuel Consumption (L/kWh) as a function of generator loading (%)."""
    keys = np.array(list(SFC_POINTS.keys()))
    values = np.array(list(SFC_POINTS.values()))
    clamped_pct = np.clip(loading_pct, 40.0, 100.0)
    return float(np.interp(clamped_pct, keys, values))

def fitness_function(power_kw: float, required_load_kw: float, generator_capacity_kw: float) -> float:
    """Objective function: minimize fuel consumption while strictly serving electrical demand."""
    deficit_penalty = max(required_load_kw - power_kw, 0.0) * 150.0
    loading = (power_kw / generator_capacity_kw) * 100.0
    loading_clamped = np.clip(loading, 40.0, 100.0)
    fuel = power_kw * sfc_curve(loading_clamped)
    return fuel + deficit_penalty

def grey_wolf_optimize_step(demand_kw: float, generator_capacity_kw: float = 150.0, 
                             num_wolves: int = 20, iterations: int = 30) -> Tuple[float, List[float]]:
    """Runs bio-inspired Grey Wolf Optimizer (Alpha, Beta, Delta wolves) to find optimal generator setpoint."""
    if demand_kw <= 0.0:
        return 0.0, [0.0]

    # Population of wolf loading fractions [0.40, 0.95]
    population = [random.uniform(0.40, 0.95) for _ in range(num_wolves)]
    convergence_history = []

    for it in range(iterations):
        # Sort wolves by fitness
        population.sort(key=lambda x: fitness_function(x * generator_capacity_kw, demand_kw, generator_capacity_kw))
        alpha, beta, delta = population[:3]

        best_fitness = fitness_function(alpha * generator_capacity_kw, demand_kw, generator_capacity_kw)
        convergence_history.append(float(best_fitness))

        a = 2.0 * (1.0 - (it / float(iterations)))

        new_population = []
        for wolf in population:
            # Alpha influence
            r1, r2 = random.random(), random.random()
            A1, C1 = 2.0 * a * r1 - a, 2.0 * r2
            X1 = alpha - A1 * abs(C1 * alpha - wolf)

            # Beta influence
            r1, r2 = random.random(), random.random()
            A2, C2 = 2.0 * a * r1 - a, 2.0 * r2
            X2 = beta - A2 * abs(C2 * beta - wolf)

            # Delta influence
            r1, r2 = random.random(), random.random()
            A3, C3 = 2.0 * a * r1 - a, 2.0 * r2
            X3 = delta - A3 * abs(C3 * delta - wolf)

            new_val = (X1 + X2 + X3) / 3.0
            new_val = max(0.40, min(0.95, new_val))
            new_population.append(new_val)

        population = new_population

    best_loading = min(population, key=lambda x: fitness_function(x * generator_capacity_kw, demand_kw, generator_capacity_kw))
    return float(best_loading), convergence_history

class OptimizerService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = OptimizerService()
        return cls._instance

    def simulate_dispatch(
        self,
        hourly_records: List[Dict[str, Any]],
        battery_capacity_kwh: float = 250.0,
        battery_max_power_kw: float = 40.0,
        initial_soc: float = 0.60,
        min_soc: float = 0.20,
        max_soc: float = 0.90,
        efficiency: float = 0.95,
        generator_capacity_kw: float = 150.0,
        wolves: int = 20,
        iterations: int = 25
    ) -> Dict[str, Any]:
        """Simulates battery storage + Grey Wolf dispatch across hourly time-steps."""
        soc = initial_soc
        dispatch_timeline = []
        total_baseline_diesel = 0.0
        total_optimized_diesel = 0.0
        alpha_convergence_sample = []

        for idx, row in enumerate(hourly_records):
            timestamp = row.get("timestamp", f"Hour {idx+1}")
            load_kw = float(row.get("predicted_load_kw", row.get("total_load_kw", 115.0)))
            renewable_kw = float(row.get("renewable_kw", row.get("renewable_output_kw", 15.0)))
            
            # Net load
            net_load_kw = max(0.0, load_kw - renewable_kw)
            surplus_kw = max(0.0, renewable_kw - load_kw)

            # 1. Renewable battery charging
            charge_kw = 0.0
            if surplus_kw > 0.0 and soc < max_soc:
                max_charge_energy = (max_soc - soc) * battery_capacity_kwh
                charge_power = min(surplus_kw * efficiency, battery_max_power_kw, max_charge_energy)
                soc += charge_power / battery_capacity_kwh
                soc = min(max_soc, soc)
                charge_kw = charge_power

            # 2. Battery discharge
            battery_output_kw = 0.0
            if net_load_kw > 0.0 and soc > min_soc:
                available_energy = max((soc - min_soc) * battery_capacity_kwh, 0.0)
                discharge = min(battery_max_power_kw, net_load_kw, available_energy)
                soc -= (discharge / efficiency) / battery_capacity_kwh
                soc = max(min_soc, soc)
                battery_output_kw = discharge

            # 3. Generator requirement after battery
            diesel_required_kw = max(0.0, net_load_kw - battery_output_kw)

            # 4. Grey Wolf Optimization for Generator setpoint
            generator_loading_pct = 0.0
            optimized_diesel_kw = 0.0
            if diesel_required_kw > 0.0:
                best_loading_ratio, conv = grey_wolf_optimize_step(
                    diesel_required_kw, generator_capacity_kw, wolves, iterations
                )
                if not alpha_convergence_sample and conv:
                    alpha_convergence_sample = conv
                
                generator_loading_pct = best_loading_ratio * 100.0
                optimized_diesel_kw = min(diesel_required_kw, generator_capacity_kw * best_loading_ratio)
                sfc = sfc_curve(generator_loading_pct)
                opt_liters = optimized_diesel_kw * sfc
            else:
                opt_liters = 0.0

            # 5. Baseline (un-optimized: generator serves net load directly, no battery)
            baseline_loading = np.clip(net_load_kw / generator_capacity_kw, 0.40, 0.95) * 100.0
            baseline_sfc = sfc_curve(baseline_loading)
            baseline_liters = net_load_kw * baseline_sfc

            total_baseline_diesel += baseline_liters
            total_optimized_diesel += opt_liters

            dispatch_timeline.append({
                "timestamp": str(timestamp),
                "load_kw": round(load_kw, 2),
                "renewable_kw": round(renewable_kw, 2),
                "net_load_kw": round(net_load_kw, 2),
                "battery_output_kw": round(battery_output_kw, 2),
                "battery_charge_kw": round(charge_kw, 2),
                "battery_soc_pct": round(soc * 100.0, 1),
                "diesel_required_kw": round(diesel_required_kw, 2),
                "optimized_diesel_kw": round(optimized_diesel_kw, 2),
                "generator_loading_pct": round(generator_loading_pct, 1),
                "diesel_liters": round(opt_liters, 2),
                "baseline_liters": round(baseline_liters, 2),
                "fuel_saved_liters": round(max(0.0, baseline_liters - opt_liters), 2)
            })

        fuel_saved = max(0.0, total_baseline_diesel - total_optimized_diesel)
        fuel_saved_pct = (fuel_saved / total_baseline_diesel * 100.0) if total_baseline_diesel > 0 else 0.0
        co2_avoided_kg = fuel_saved * DIESEL_CO2_FACTOR

        # Generator loading distribution (histogram buckets)
        loadings = [d["generator_loading_pct"] for d in dispatch_timeline if d["generator_loading_pct"] > 0]
        bins = {"<40% (Underload)": 0, "40-69% (Sub-optimal)": 0, "70-85% (Optimal Sweet Spot)": 0, "86-100% (High Load)": 0}
        for l in loadings:
            if l < 40:
                bins["<40% (Underload)"] += 1
            elif l < 70:
                bins["40-69% (Sub-optimal)"] += 1
            elif l <= 85:
                bins["70-85% (Optimal Sweet Spot)"] += 1
            else:
                bins["86-100% (High Load)"] += 1

        return {
            "summary": {
                "total_baseline_diesel_l": round(total_baseline_diesel, 1),
                "total_optimized_diesel_l": round(total_optimized_diesel, 1),
                "fuel_saved_l": round(fuel_saved, 1),
                "fuel_saved_pct": round(fuel_saved_pct, 2),
                "co2_avoided_kg": round(co2_avoided_kg, 1),
                "avg_generator_loading_pct": round(float(np.mean(loadings)) if loadings else 0.0, 1),
                "final_battery_soc_pct": round(soc * 100.0, 1),
                "simulated_hours": len(dispatch_timeline)
            },
            "loading_distribution": [{"zone": k, "count": v} for k, v in bins.items()],
            "gwo_convergence": alpha_convergence_sample,
            "timeline": dispatch_timeline
        }

def get_optimizer() -> OptimizerService:
    return OptimizerService.get_instance()
