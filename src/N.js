import React from 'react';
import Bignumber from 'bignumber.js';

const exponentialThreshold = Bignumber(10000);

export default function N({ value, round = false }) {
  const val = round ? value.integerValue(Bignumber.ROUND_FLOOR) : value;
  return <>{val.isGreaterThan(exponentialThreshold) ? val.toExponential(3) : val.toFixed()}</>;
}
