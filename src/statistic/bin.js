import { bisect, ticks, identity, group, tickStep, floor, ceil } from '../utils';
import { min, max, createAggregate } from './aggregate';

// export function bin(data, count, field) {
//   const accessor = (d) => d[field];
//   const minValue = min(data, accessor);
//   const maxValue = max(data, accessor);
//   const thresholds = ticks(minValue, maxValue, count);

//   return data.map((d) => {
//     const i = bisect(thresholds, d, 0, thresholds.length, accessor);
//     return {
//       ...d,
//       [field]: thresholds[i],
//     };
//   });
// }

// export function createBin({ fields: F, thresholds: T, aggregateType, aggregateField }) {
//   const I = index(F);
//   return (data) => {
//     const aggregate = chooseSummary(aggregateType)({
//       fields: [aggregateField],
//       as: [aggregateType],
//       key: (d) => I.map((i) => d[F[i]]).join('-'),
//     });
//     const binnedData = I.reduce((data, i) => bin(data, T[i], F[i]), data);
//     console.log(binnedData)
//     return aggregate(binnedData);
//   };
// }

function bin(values, count = 10, accessor = identity) {
  const minValue = min(values, accessor);
  const maxValue = max(values, accessor);
  const step = tickStep(minValue, maxValue, count);
  const niceMain = floor(minValue, step);
  const niceMax = ceil(maxValue, step);
  return ticks(niceMain, niceMax, count);
}

export function createBin({ fields, count, aggregateType, aggregateField, as = [] }) {
  const [x, y] = fields;
  const [x1 = x, y1 = y] = as;
  const [cx, cy] = count;
  return (data) => {
    const thresholdsX = x ? bin(data, cx, (d) => d[x]) : [];
    const thresholdsY = y ? bin(data, cy, (d) => d[y]) : [];
    const key = (d) => {
      const i = bisect(thresholdsX, d[x]);
      const j = bisect(thresholdsY, d[y]);
      return `${thresholdsX[i]}-${thresholdsY[j]}`;
    };
    return Array.from(group(data, key).entries()).map(([key, values]) => {
      const aggregate = createAggregate(aggregateType);
      const value = aggregate(values, (d) => d[aggregateField]);
      const [tx, ty] = key.split('-').map((d) => +d);
      return {
        ...values[0],
        [aggregateType]: value,
        ...x1 && { [x1]: tx },
        ...y1 && { [y1]: ty },
      };
    });
  };
}
