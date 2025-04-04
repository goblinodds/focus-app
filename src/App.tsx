// src/App.tsx
import { useState, useEffect } from 'react';
import './styles/themes.css';
import { taskLists, Task } from './data/private/tasks';

const getCurrentBlock = (): keyof typeof taskLists => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  if (day === 0 || day === 6) {
    if (hour < 14) return 'home';
    return 'fun';
  }
  if (hour < 11) return 'admin';
  if (hour < 17) return 'work';
  if (hour < 20) return 'home';
  return 'fun';
};

function App() {
  const [manualOverride, setManualOverride] = useState(false);
  const [index, setIndex] = useState(0);
  const [block, setBlock] = useState<keyof typeof taskLists>(getCurrentBlock());
  const tasks = taskLists[block];
  const currentTask: Task | undefined = tasks[index];

  // Automatically return to auto mode
  useEffect(() => {
    if (!manualOverride) {
      const interval = setInterval(() => {
        const newBlock = getCurrentBlock();
        setBlock(newBlock);
        setIndex(0);
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [manualOverride]);

  useEffect(() => {
    document.body.className = `${block}-theme`;
  }, [block]);

  const handleSkip = () => {
    setIndex((i) => i + 1);
  };

  const blocks: (keyof typeof taskLists)[] = ['admin', 'work', 'home', 'fun'];

  return (
    <>
      <div className="top-nav">
        <div className="list-selector">
          {blocks.map((b) => (
            <button
              key={b}
              className={`list-button ${block === b ? 'active' : ''}`}
              data-block={b}
              onClick={() => {
                if (manualOverride && block === b) {
                  setManualOverride(false);
                  setBlock(getCurrentBlock());
                  setIndex(0);
                } else {
                  setBlock(b);
                  setIndex(0);
                  setManualOverride(true);
                }
              }}
            >
              {b.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        {manualOverride && <div className="override-notice">Manual override active</div>}

        <h1>are you down to...</h1>
        {currentTask ? (
          <>
            <div className={currentTask.subtasks ? 'task task-has-subtasks' : 'task'}>
              ✦ {currentTask.task}
            </div>
            {currentTask.subtasks && (
              <div className="subtasks-container open">
                {currentTask.subtasks.map((sub, i) => (
                  <div className="subtask" key={i}>→ {sub}</div>
                ))}
              </div>
            )}
            <div className="buttons">
              <button id="no-button" onClick={handleSkip}>SKIP</button>
            </div>
          </>
        ) : (
          <div className="completed">
            <h2>No more tasks in this list</h2>
            <button className="reset-button" onClick={() => setIndex(0)}>Start Over</button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
