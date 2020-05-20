import Bignumber from 'bignumber.js';
import { useCallback, useReducer } from 'react';
import { useInterval } from './timers';

const producerTypes = {
  alpha: {
    label: 'Alpha',
    basePrice: Bignumber(10),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'energy',
    productionRate: Bignumber(1),
  },
  beta: {
    label: 'Beta',
    basePrice: Bignumber(100),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'alpha',
    productionRate: Bignumber(1),
  },
  gamma: {
    label: 'Gamma',
    basePrice: Bignumber(10000),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'beta',
    productionRate: Bignumber(1),
  },
  delta: {
    label: 'Delta',
    basePrice: Bignumber(1000000),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'gamma',
    productionRate: Bignumber(1),
  },
  epsilon: {
    label: 'Epsilon',
    basePrice: Bignumber(10000000),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'delta',
    productionRate: Bignumber(1),
  },
  zeta: {
    label: 'Zeta',
    basePrice: Bignumber(1000000),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'epsilon',
    productionRate: Bignumber(1),
  },
};

const producerTypeOrder = ['zeta', 'epsilon', 'delta', 'gamma', 'beta', 'alpha'];

function reducer(state, action) {
  switch (action.type) {
    case 'tick': {
      if (!state.lastTick) return { ...state, lastTick: action.time };

      const seconds = Bignumber(action.time - state.lastTick).dividedBy(1000);

      const producers = {};
      let energyPerSecond = Bignumber(0);
      producerTypeOrder.forEach((type) => {
        const producer = state.producers[type];
        if (producer) {
          const countFraction = producer.countFraction.plus(producer.increaseRate.times(seconds));
          const count = countFraction.integerValue(Bignumber.ROUND_FLOOR);
          const productionRate = count.times(producerTypes[type].productionRate);
          producers[type] = { ...producer, ...producers[type], count, countFraction, productionRate };

          if (producer.productionType === 'energy') {
            energyPerSecond = energyPerSecond.plus(productionRate);
          } else {
            producers[producer.productionType] = {
              ...producers[producer.productionType],
              increaseRate: productionRate,
            };
          }
        }
      });

      return {
        ...state,
        energy: state.energy.plus(energyPerSecond.times(seconds)),
        energyPerSecond,
        producers,
        lastTick: action.time,
      };
    }
    case 'purchase-producer': {
      const producerType = producerTypes[action.producer];
      const currentProducer = state.producers[action.producer];
      const price = currentProducer ? currentProducer.price : producerType.basePrice;
      const nextCount = currentProducer ? currentProducer.count.plus(Bignumber(1)) : Bignumber(1);
      const productionType = producerType.productionType;

      const producers = {
        ...state.producers,
        [action.producer]: {
          count: nextCount,
          countFraction: nextCount,
          increaseRate: currentProducer ? currentProducer.increaseRate : Bignumber(0),
          productionType,
          productionRate: producerType.productionRate.times(nextCount),
          price: price.times(producerType.priceIncreaseFactor),
        },
        ...(productionType in state.producers && {
          [productionType]: {
            ...state.producers[productionType],
            increaseRate: state.producers[productionType].increaseRate.plus(producerType.productionRate),
          },
        }),
      };

      return {
        ...state,
        energy: state.energy.minus(price),
        energyPerSecond: producers.alpha ? producers.alpha.productionRate : Bignumber(0),
        producers,
      };
    }
    default:
      return state;
  }
}

const initialState = {
  energy: Bignumber(10),
  energyPerSecond: Bignumber(0),
  producers: {},
};

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const tick = useCallback((time) => {
    dispatch({ type: 'tick', time });
  }, []);

  useInterval(tick, 100);

  const purchaseProducer = useCallback((producer, count) => dispatch({ type: 'purchase-producer', producer, count }), []);

  return {
    state,
    producerTypes,
    purchaseProducer,
  };
}
