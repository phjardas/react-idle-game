import Bignumber from 'bignumber.js';
import { useCallback, useReducer } from 'react';
import { useInterval } from './timers';

const producerTypes = {
  worker: {
    label: 'Worker',
    basePrice: Bignumber(5),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    baseProduction: Bignumber(1),
  },
  team: {
    label: 'Team',
    basePrice: Bignumber(100),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    baseProduction: Bignumber(10),
  },
  factory: {
    label: 'Factory',
    basePrice: Bignumber(1000),
    priceIncreaseFactor: Bignumber(12).dividedBy(10),
    baseProduction: Bignumber(100),
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'tick': {
      if (!state.lastTick) return { ...state, lastTick: action.time };

      const seconds = Bignumber(action.time - state.lastTick).dividedBy(1000);

      return {
        ...state,
        money: state.money.plus(state.moneyPerSecond.times(seconds)),
        lastTick: action.time,
      };
    }
    case 'purchase-producer': {
      const producerType = producerTypes[action.producer];
      const currentProducer = state.producers[action.producer];
      const price = currentProducer ? currentProducer.price : producerType.basePrice;
      const nextLevel = currentProducer ? currentProducer.level + 1 : 1;

      const producers = {
        ...state.producers,
        [action.producer]: {
          level: nextLevel,
          production: producerType.baseProduction.times(nextLevel),
          price: price.times(producerType.priceIncreaseFactor),
        },
      };

      return {
        ...state,
        money: state.money.minus(price),
        moneyPerSecond: Object.values(producers).reduce((sum, producer) => sum.plus(producer.production), Bignumber(0)),
        producers,
      };
    }
    default:
      return state;
  }
}

const initialState = {
  money: Bignumber(10),
  moneyPerSecond: Bignumber(0),
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
