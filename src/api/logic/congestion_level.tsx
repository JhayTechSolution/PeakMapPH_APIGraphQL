export function getCongestionLevel(passengerCount: number, maxCapacity: number): string {
    const ratio = passengerCount / maxCapacity;
    //percentage 
    /*
    1-49 LIGHT 
    50-79 MODERATE
    80-99 CRITICAL
    100 FULL
    */
    if (ratio < 0.5) {
        return "LIGHT";
    } else if (ratio < 0.8) {
        return "MODERATE";
    } else if (ratio < 1) {
        return "CRITICAL";
    } else {
        return "FULL";
    }
}