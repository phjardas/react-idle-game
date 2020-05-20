import React from 'react';
import { useGame } from './Game';
import './index.css';
import N from './N';

export default function App() {
  const { state, producerTypes, purchaseProducer, reset } = useGame();

  return (
    <div className="wrapper">
      <h1>React Idle Game</h1>
      <div>
        Energy: <N value={state.energy} round /> (+
        <N value={state.energyPerSecond} />
        /s)
        <button className="reset" onClick={reset}>
          RESET GAME
        </button>
      </div>
      <table className="producers">
        <thead>
          <tr>
            <th>Producer</th>
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

      <p>
        This is a little incremental game implemented in vanilla React. It's just an experiment and probably not much fun. It certainly doesn't come with the
        depth you would normally expect from incremental games. In case you wonder: there's nothing more to see once you reach Kappa.
      </p>
      <p>
        The source code is <a href="https://github.com/phjardas/react-idle-game">hosted on GitHub</a>.
      </p>
      <p>Written in 2020 by Philipp Jardas</p>
    </div>
  );
}
