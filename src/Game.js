import Bignumber from 'bignumber.js';
import { useCallback, useReducer, useEffect } from 'react';
import { useInterval } from './timers';

const initialState = {
  energy: Bignumber(10),
  energyPerSecond: Bignumber(0),
  producers: {},
};

const localStorageKey = 'incremental:game';

const producerTypes = {
  alpha: {
    label: 'Alpha',
    basePrice: Bignumber(1e1),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'energy',
    productionRate: Bignumber(1),
  },
  beta: {
    label: 'Beta',
    basePrice: Bignumber(1e2),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'alpha',
    productionRate: Bignumber(1),
  },
  gamma: {
    label: 'Gamma',
    basePrice: Bignumber(1e4),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'beta',
    productionRate: Bignumber(1),
  },
  delta: {
    label: 'Delta',
    basePrice: Bignumber(1e6),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'gamma',
    productionRate: Bignumber(1),
  },
  epsilon: {
    label: 'Epsilon',
    basePrice: Bignumber(1e8),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'delta',
    productionRate: Bignumber(1),
  },
  zeta: {
    label: 'Zeta',
    basePrice: Bignumber(1e10),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'epsilon',
    productionRate: Bignumber(1),
  },
  eta: {
    label: 'Eta',
    basePrice: Bignumber(1e12),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'zeta',
    productionRate: Bignumber(1),
  },
  iota: {
    label: 'Iota',
    basePrice: Bignumber(1e14),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'eta',
    productionRate: Bignumber(1),
  },
  kappa: {
    label: 'Kappa',
    basePrice: Bignumber(1e16),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    productionType: 'iota',
    productionRate: Bignumber(1),
  },
};

const producerTypeOrder = ['kappa', 'iota', 'eta', 'zeta', 'epsilon', 'delta', 'gamma', 'beta', 'alpha'];

export function multiPriceFactor(priceIncreaseFactor, count) {
  let factor = Bignumber(1);
  for (let i = 1; i < count; i++) {
    factor = factor.plus(priceIncreaseFactor.pow(i));
  }
  return factor;
}

function reducer(state, action) {
  switch (action.type) {
    case 'reset': {
      return initialState;
    }

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
      const count = Bignumber(action.count || 1);
      const producerType = producerTypes[action.producer];
      const currentProducer = state.producers[action.producer];
      const price = multiPriceFactor(producerType.priceIncreaseFactor, count).times(currentProducer ? currentProducer.price : producerType.basePrice);
      const nextCount = currentProducer ? currentProducer.count.plus(count) : count;
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

const storedState = (() => {
  const stored = window.localStorage.getItem(localStorageKey);
  if (stored) {
    const game = JSON.parse(stored);
    return {
      energy: Bignumber(game.energy),
      energyPerSecond: Bignumber(game.energyPerSecond),
      lastTick: game.lastTick,
      producers: Object.entries(game.producers).reduce(
        (a, [k, p]) => ({
          ...a,
          [k]: {
            count: Bignumber(p.count),
            countFraction: Bignumber(p.countFraction),
            increaseRate: Bignumber(p.increaseRate),
            price: Bignumber(p.price),
            productionRate: Bignumber(p.productionRate),
            productionType: p.productionType,
          },
        }),
        {}
      ),
    };
  }
  return initialState;
})();

export function useGame() {
  const [state, dispatch] = useReducer(reducer, storedState);

  // FIXME do not persist on EVERY update but rather once per second or so
  useEffect(() => localStorage.setItem(localStorageKey, JSON.stringify(state)), [state]);

  const tick = useCallback((time) => {
    dispatch({ type: 'tick', time });
  }, []);

  useInterval(tick, 100);

  const purchaseProducer = useCallback((producer, count) => dispatch({ type: 'purchase-producer', producer, count }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return {
    state,
    producerTypes,
    purchaseProducer,
    reset,
  };
}
