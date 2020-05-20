import React from 'react';
import Button from './Button';
import { useGame, multiPriceFactor } from './Game';
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
        <Button className="reset" onClick={reset}>
          RESET GAME
        </Button>
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
              const price5 = multiPriceFactor(producerType.priceIncreaseFactor, 5).times(price);
              const price10 = multiPriceFactor(producerType.priceIncreaseFactor, 10).times(price);

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
                    <div className="producer-buttons">
                      <Button onClick={() => purchaseProducer(type, 1)} disabled={price.isGreaterThan(state.energy)} progress={state.energy.dividedBy(price)}>
                        <span className="count">+1</span>
                        <N value={price} round className="price" />
                      </Button>
                      <Button onClick={() => purchaseProducer(type, 5)} disabled={price5.isGreaterThan(state.energy)} progress={state.energy.dividedBy(price5)}>
                        <span className="count">+5</span>
                        <N value={price5} round className="price" />
                      </Button>
                      <Button
                        onClick={() => purchaseProducer(type, 10)}
                        disabled={price10.isGreaterThan(state.energy)}
                        progress={state.energy.dividedBy(price10)}
                      >
                        <span className="count">+10</span>
                        <N value={price10} round className="price" />
                      </Button>
                    </div>
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
