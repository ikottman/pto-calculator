
function isSunday(date) {
  return date.getDay() === 0;
}

function incrementDay(date) {
  date.setDate(date.getDate() + 1);
}

export function weeksBetweenDates(start, end) {
  let date = new Date(start.getTime());
  let numSundays = 0;
  do {
    incrementDay(date);
    if (isSunday(date)) { 
      numSundays++; 
    }
  } while (date.getTime() < end.getTime())

  return numSundays;
}
