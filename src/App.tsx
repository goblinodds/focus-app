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
  const [showSubtasks, setShowSubtasks] = useState(false);
  const tasks = taskLists[block];
  const today = new Date();
  const visibleTasks = tasks.filter((task) => {
    if (!task.startDate) return true;
    return new Date(task.startDate) <= today;
  });
  const currentTask: Task | undefined = visibleTasks[index];

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
    document.body.className = (block as string) + '-theme';
  }, [block]);

  const handleSkip = () => {
    setShowSubtasks(false);
    setIndex((i) => i + 1);
  };

  const toggleSubtasks = () => {
    setShowSubtasks((s) => !s);
  };

  const blocks = ['admin', 'work', 'home', 'fun'] as const;


  return (
    <>
      <div className="top-nav">
        <div className="list-selector">
          {blocks.map((b) => (
            <button
              key={String(b)}
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
        {!manualOverride && <div className="override-notice">Auto mode (based on time of day)</div>}
        {manualOverride && <div className="override-notice">Manual override active</div>}

        <h1>are you down to...</h1>
        {currentTask ? (
          <>
            <div className={`task ${currentTask.subtasks ? 'task-has-subtasks' : ''}`} onClick={toggleSubtasks}>
              {currentTask.subtasks ? (
                <span>{showSubtasks ? '▾ ' : '▸ '}</span>
              ) : (
                <span>✦ </span>
              )}
              {currentTask.link ? (
                <a href={currentTask.link} target="_blank" rel="noopener noreferrer">
                  {currentTask.task}
                </a>
              ) : (
                <span>{currentTask.task}</span>
              )}
            </div>
            {currentTask.subtasks && showSubtasks && (
              <div className="subtasks-container open">
                {currentTask.subtasks.map((sub, i) => {
                  if (typeof sub === 'string') {
                    return <div className="subtask" key={i}>{sub}</div>;
                  }
                  return (
                    <div className="subtask" key={i}>
                      {sub.link ? (
                        <a href={sub.link} target="_blank" rel="noopener noreferrer">
                          {sub.text}
                        </a>
                      ) : (
                        sub.text
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="buttons">
              <button id="no-button" onClick={handleSkip}>SKIP</button>
            </div>
          </>
        ) : (
          <div className="completed">
            <button className="reset-button" onClick={() => setIndex(0)}>start over</button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
