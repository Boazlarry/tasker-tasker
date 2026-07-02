import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { render } from '@/test/render';
import { Platform, usePlatformManager } from './usePlatformManager';

const storedPlatform: Platform = {
  id: 'jira-1',
  type: 'jira',
  name: 'Company Jira',
  url: 'https://jira.example.com',
  auth: {
    username: 'user@example.com',
    apiToken: 'token',
  },
};

function Harness() {
  const { platforms, loading, addPlatform, updatePlatform, deletePlatform } = usePlatformManager();

  if (loading) {
    return <div>loading</div>;
  }

  const firstPlatform = platforms[0];

  return (
    <div>
      <div data-testid="count">{platforms.length}</div>
      <div data-testid="names">{platforms.map((platform) => platform.name).join(',')}</div>
      <button
        type="button"
        onClick={() =>
          addPlatform({
            type: 'jira',
            name: 'Added Jira',
            url: 'https://added.example.com',
            auth: { username: 'added@example.com', apiToken: 'added-token' },
          })
        }
      >
        add
      </button>
      <button
        type="button"
        onClick={() => firstPlatform && updatePlatform({ ...firstPlatform, name: 'Renamed Jira' })}
      >
        rename
      </button>
      <button type="button" onClick={() => firstPlatform && deletePlatform(firstPlatform.id)}>
        delete
      </button>
    </div>
  );
}

describe('usePlatformManager', () => {
  it('loads saved platforms from localStorage', async () => {
    localStorage.setItem('tasker-platforms', JSON.stringify([storedPlatform]));

    render(<Harness />);

    await waitFor(() => expect(screen.getByTestId('names')).toHaveTextContent('Company Jira'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('adds, updates, and deletes platforms', async () => {
    const user = userEvent.setup();

    render(<Harness />);

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'));

    await user.click(screen.getByRole('button', { name: 'add' }));
    expect(screen.getByTestId('names')).toHaveTextContent('Added Jira');
    expect(JSON.parse(localStorage.getItem('tasker-platforms') || '[]')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'rename' }));
    expect(screen.getByTestId('names')).toHaveTextContent('Renamed Jira');

    await user.click(screen.getByRole('button', { name: 'delete' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(JSON.parse(localStorage.getItem('tasker-platforms') || '[]')).toHaveLength(0);
  });
});

