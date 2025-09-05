// 复杂的状态机 - 高复杂度 (复杂度: 15+)
function stateMachine(currentState, action, data) {
  let nextState = currentState;
  let output = null;

  switch (currentState) {
    case 'idle':
      if (action === 'start') {
        nextState = data && data.mode === 'fast' ? 'running_fast' : 'running_slow';
      } else if (action === 'configure') {
        nextState = 'configuring';
      }
      break;

    case 'running_slow':
      if (action === 'speed_up') {
        nextState = 'running_fast';
      } else if (action === 'stop') {
        nextState = 'idle';
      } else if (action === 'pause') {
        nextState = 'paused';
      } else if (action === 'error') {
        nextState = 'error';
      }
      break;

    case 'running_fast':
      if (action === 'slow_down') {
        nextState = 'running_slow';
      } else if (action === 'stop') {
        nextState = 'idle';
      } else if (action === 'pause') {
        nextState = 'paused';
      } else if (action === 'error') {
        nextState = 'error';
      } else if (action === 'overheat') {
        nextState = 'cooling';
      }
      break;

    case 'paused':
      if (action === 'resume') {
        nextState = data && data.previous === 'fast' ? 'running_fast' : 'running_slow';
      } else if (action === 'stop') {
        nextState = 'idle';
      }
      break;

    case 'error':
      if (action === 'reset') {
        nextState = 'idle';
      } else if (action === 'repair' && data && data.success) {
        nextState = 'idle';
      }
      break;

    case 'cooling':
      if (action === 'cooled') {
        nextState = 'running_slow';
      } else if (action === 'stop') {
        nextState = 'idle';
      }
      break;

    default:
      nextState = 'error';
  }

  // 复杂的输出逻辑
  if (nextState !== currentState) {
    output = generateOutput(currentState, nextState, action, data);
  }

  return { state: nextState, output };
}

function generateOutput(fromState, toState, action, data) {
  const timestamp = Date.now();
  let message = '';
  let level = 'info';

  if (toState === 'error') {
    level = 'error';
    message = data && data.error ? data.error : 'Unknown error occurred';
  } else if (fromState === 'error' && toState === 'idle') {
    level = 'success';
    message = 'System recovered';
  } else if (toState.includes('running')) {
    level = 'info';
    message = `Started ${toState.split('_')[1]} mode`;
  } else if (toState === 'paused') {
    level = 'warning';
    message = 'System paused';
  }

  return {
    timestamp,
    level,
    message,
    transition: `${fromState} -> ${toState}`,
    action
  };
}
