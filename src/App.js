import React from 'react';
import classes from './App.module.css';
import { useGame } from './Game';
import N from './N';

export default function App() {
  const { state, producerTypes, purchaseProducer } = useGame();

  return (
    <>
      <div>
        Energy: <N value={state.energy} round /> (+
        <N value={state.energyPerSecond} />
        /s)
      </div>
      <table className={classes.producers}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Count</th>
            <th>Production</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(producerTypes)
            .filter((type) => {
              const { productionType } = producerTypes[type];
              return productionType === 'energy' || productionType in state.producers;
            })
            .map((type) => {
              const producerType = producerTypes[type];
              const producer = state.producers[type];
              const price = producer ? producer.price : producerType.basePrice;

              return (
                <tr key={type}>
                  <th>{producerType.label}</th>
                  <td>
                    {producer && (
                      <>
                        <N value={producer.count} />
                        {producer.increaseRate.isGreaterThan(0) && (
                          <>
                            {' '}
                            (+
                            <N value={producer.increaseRate} />
                            /s)
                          </>
                        )}
                      </>
                    )}
                  </td>
                  <td>
                    {producer && (
                      <>
                        <N value={producer.productionRate} /> {producer.productionType}/s
                      </>
                    )}
                  </td>
                  <td>
                    <button onClick={() => purchaseProducer(type, 1)} disabled={price.isGreaterThan(state.energy)}>
                      buy 1 for <N value={price} round />
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
