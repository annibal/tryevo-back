/**
 * Aggregates data based on a specified time interval, either summing up or averaging values within each interval.
 * The function returns an array of objects containing aggregated time and value pairs.
 *
 * @param data An array of objects containing time and value pairs.
 * @param interval The time interval in milliseconds for aggregation.
 * @param config An object containing configuration options:
 *               - startTime: The start time in "HH:mm:ss" format for each day's aggregation. Default is "00:00:00".
 *               - endTime: The end time in "HH:mm:ss" format for each day's aggregation. Default is "23:59:59".
 *               - aggregationType: The type of aggregation to perform. Use "sum" to calculate the sum or "average" to calculate the average.
 * @returns An array of objects with aggregated time and summed or averaged value pairs.
 * @author ChatGPT
 */
module.exports = function aggregateData(
  data,
  interval,
  config,
) {
  const {
    startTime = "00:00:00",
    endTime = "23:59:59",
    aggregationType = "sum",
  } = config || {};

  data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const aggregated = [];
  const timeIntervals = {};

  // Group data by date
  data.forEach((entry) => {
    const date = entry.time.split("T")[0];
    if (!timeIntervals[date]) {
      timeIntervals[date] = [];
    }
    timeIntervals[date].push(entry);
  });

  // Iterate through each date
  Object.keys(timeIntervals).forEach((date) => {
    const dailyData = timeIntervals[date];

    // Sort data for each date by time
    dailyData.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // Get start and end times for the current date
    const startTimeToday = new Date(`${date}T${startTime}Z`);
    const endTimeToday = new Date(`${date}T${endTime}Z`);

    let currentTime = new Date(startTimeToday);
    let sum = 0;
    let count = 0;
    let dataIndex = 0;

    while (currentTime <= endTimeToday) {
      if (dataIndex < dailyData.length) {
        const dataTime = new Date(dailyData[dataIndex].time);

        if (dataTime < currentTime) {
          sum += dailyData[dataIndex].value;
          count++;
          dataIndex++;
          continue;
        }
      }

      let aggregatedValue = 0;
      if (aggregationType === "sum") {
        aggregatedValue = sum;
      } else if (aggregationType === "average") {
        aggregatedValue = count > 0 ? sum / count : 0;
      }

      aggregated.push({
        time: currentTime.toISOString(),
        value: aggregatedValue,
      });

      sum = 0;
      count = 0;
      currentTime = new Date(currentTime.getTime() + interval);
    }
  });

  return aggregated;
}