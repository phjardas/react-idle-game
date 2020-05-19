import React, { useReducer, useCallback, useRef, useEffect } from 'react';
import Bignumber from 'bignumber.js';
import classes from './Game.module.css';

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

export default function Game() {
  const { state, purchaseProducer } = useGame();

  return (
    <>
      <div>
        Money: {state.money.toFixed(0)} ({state.moneyPerSecond.toFixed(0)}/s)
      </div>
      <table className={classes.producers}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Level</th>
            <th>Production</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(producerTypes).map((type) => {
            const producerType = producerTypes[type];
            const producer = state.producers[type];
            const price = producer ? producer.price : producerType.basePrice;

            return (
              <tr key={type}>
                <th>{producerType.label}</th>
                <td>{producer && producer.level.toString()}</td>
                <td>{producer && <>{producer.production.toFixed(0)}/s</>}</td>
                <td>
                  <button onClick={() => purchaseProducer(type, 1)} disabled={price.isGreaterThan(state.money)}>
                    buy 1 for {price.toFixed(0)}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const tick = useCallback((time) => {
    dispatch({ type: 'tick', time });
  }, []);

  useAnimationFrame(tick);

  const purchaseProducer = useCallback((producer, count) => dispatch({ type: 'purchase-producer', producer, count }), []);

  return {
    state,
    purchaseProducer,
  };
}

function useAnimationFrame(callback) {
  const handle = useRef();

  const tick = useCallback(
    (time) => {
      callback(time);
      handle.current = window.requestAnimationFrame(tick);
    },
    [callback]
  );

  useEffect(() => {
    handle.current = window.requestAnimationFrame(tick);
    return () => {
      handle.current && window.cancelAnimationFrame(handle.current);
    };
  }, [tick]);
}
