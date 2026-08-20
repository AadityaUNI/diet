import { describe, it, expect } from 'vitest';
import { hydrateDraft } from '@/lib/hydratePlanDraft';
import { expected_empty, expected_general, general_draft, empty_draft } from './mock_data/mock_plan_drafts';

describe('Testing Hydrate Plans Util Function', () => {
  it("Hydrating plan draft with 0's, decimal values and whole numbers", () => {
    expect(hydrateDraft(general_draft)).toStrictEqual(expected_general);
});

  it("Hydrating empty plan draft", () => {
    expect(hydrateDraft(empty_draft)).toStrictEqual(expected_empty);
  })
});