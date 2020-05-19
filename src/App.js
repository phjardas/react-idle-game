import React from 'react';
import { useGame } from './Game';
import classes from './App.module.css';

export default function App() {
  const { state, producerTypes, purchaseProducer } = useGame();

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
