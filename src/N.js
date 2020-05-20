import React from 'react';
import Bignumber from 'bignumber.js';

const exponentialThreshold = Bignumber(1e6);

export default function N({ value, round = false, ...props }) {
  const val = round ? value.integerValue(Bignumber.ROUND_FLOOR) : value;
  return <span {...props}>{val.gte(exponentialThreshold) ? val.toExponential(3) : val.toNumber().toLocaleString()}</span>;
}
