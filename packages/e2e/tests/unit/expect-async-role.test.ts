import { describe, expect as vexpect, it } from 'vitest';
import type { SemanticNode } from '../../src/engine/surface.ts';
import { expect as expectFixture } from '../../src/expect/index.ts';
import { createScreenFixture } from '../helpers/screen-fixture.ts';
import { useFakeTime } from '../helpers/fake-time.ts';

useFakeTime();

const button: SemanticNode = {
  ref: { id: 'node-1', revision: '' },
  role: 'button',
  name: 'Save',
  testId: 'save',
};
const switched: SemanticNode = {
  ref: { id: 'node-2', revision: '' },
  role: 'switch',
  name: 'Dark mode',
  testId: 'theme',
};
const image: SemanticNode = {
  ref: { id: 'node-3', revision: '' },
  role: 'image',
  name: 'Chart',
  testId: 'chart',
};
const unnamed: SemanticNode = { ref: { id: 'node-4', revision: '' }, text: 'Card', testId: 'card' };
const secure: SemanticNode = {
  ref: { id: 'node-5', revision: '' },
  role: 'textbox',
  name: 'Password',
  testId: 'password',
  states: { secure: true },
};

const screen = createScreenFixture([button, switched, image, unnamed, secure]);
const at = (testId: string) => expectFixture(screen.getByTestId(testId));
const soon = { timeout: 50 };

describe('toHaveRole', () => {
  it('matches the role string the engine stored', async () => {
    await at('save').toHaveRole('button');
    await at('theme').toHaveRole('switch');
    await at('chart').toHaveRole('image');
    await at('password').toHaveRole('textbox');
  });

  it('compares the whole string, case included, with no role hierarchy', async () => {
    await at('save').not.toHaveRole('Button', soon);
    await at('save').not.toHaveRole('button ', soon);
    await at('theme').not.toHaveRole('checkbox', soon);
    await at('chart').not.toHaveRole('img', soon);
    await vexpect(at('save').toHaveRole('Button', soon)).rejects.toMatchObject({
      code: 'ASSERTION_FAILED',
      message: vexpect.stringContaining('observed: role "button"'),
    });
    await vexpect(at('theme').toHaveRole('checkbox', soon)).rejects.toMatchObject({
      code: 'ASSERTION_FAILED',
      message: vexpect.stringContaining('expected: role "checkbox"'),
    });
  });

  it('reads a node stored with no role as the empty string, negated too', async () => {
    await at('card').toHaveRole('');
    await at('card').not.toHaveRole('generic', soon);
    await at('card').not.toHaveRole('button', soon);
    await vexpect(at('card').toHaveRole('generic', soon)).rejects.toMatchObject({
      code: 'ASSERTION_FAILED',
      message: vexpect.stringContaining('observed: role ""'),
    });
    await vexpect(at('card').not.toHaveRole('', soon)).rejects.toMatchObject({
      code: 'ASSERTION_FAILED',
      message: vexpect.stringContaining('expected: not role ""'),
    });
  });

  it('keeps polling a missing node, negated too', async () => {
    await vexpect(at('missing').toHaveRole('button', soon)).rejects.toMatchObject({
      code: 'ASSERTION_FAILED',
      message: vexpect.stringContaining('observed: no node (match count 0)'),
    });
    await vexpect(at('missing').not.toHaveRole('button', soon)).rejects.toMatchObject({
      code: 'ASSERTION_FAILED',
      message: vexpect.stringContaining('expect.not.toHaveRole failed'),
    });
  });

  it('names the locator and the role it saw', async () => {
    await vexpect(at('save').toHaveRole('link', soon)).rejects.toMatchObject({
      code: 'ASSERTION_FAILED',
      message: [
        'expect.toHaveRole failed',
        'locator: getByTestId("save")',
        'expected: role "link"',
        'observed: role "button" (match count 1)',
      ].join('\n'),
      details: { locator: 'getByTestId("save")', expected: 'role "link"', observed: 'role "button"', matches: 1 },
    });
  });

  it('refuses a role that is not a string before it reads', () => {
    vexpect(() => at('save').toHaveRole(/button/ as never)).toThrow(
      vexpect.objectContaining({
        code: 'INVALID_ARGUMENT',
        message: 'expect.toHaveRole role must be a string, got object',
      }),
    );
    vexpect(() => at('save').not.toHaveRole(1 as never)).toThrow(
      vexpect.objectContaining({
        code: 'INVALID_ARGUMENT',
        message: vexpect.stringContaining('expect.not.toHaveRole role must be a string, got number'),
      }),
    );
  });

  it('refuses an option it does not take', () => {
    vexpect(() => at('save').toHaveRole('button', { ignoreCase: true } as never)).toThrow(
      vexpect.objectContaining({
        code: 'INVALID_ARGUMENT',
        message: vexpect.stringContaining('has no key "ignoreCase"'),
      }),
    );
  });
});
