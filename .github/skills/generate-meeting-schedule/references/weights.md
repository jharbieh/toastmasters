# Role Weight Reference

Weights determine how frequently a member is assigned each role over a 52-week period. They are expressed as percentages and **must sum to 100** per goal type.

The agent presents these defaults before generating a schedule and asks the user to confirm or adjust them.

---

## Default Weight Tables

### `public_speaker` — Members focused on developing public speaking skills

| Role | Weight (%) | Rationale |
|------|:----------:|-----------|
| Speaker | 35 | Core speaking practice — the most direct path to improvement |
| Toastmaster | 20 | Hosting improves stage presence, introductions, and flow management |
| Table Topics Master | 15 | Builds impromptu speaking and facilitation confidence |
| Evaluator | 10 | Evaluating others sharpens awareness of speaking techniques |
| General Evaluator | 5 | Exposure to holistic meeting critique |
| Grammarian | 5 | Language awareness directly improves speech quality |
| Word of the Day Master | 5 | Vocabulary enrichment supports richer speeches |
| Timer | 3 | Minimal but important for time awareness |
| Ah Counter | 2 | Builds awareness of filler words in one's own speech |
| **Total** | **100** | |

---

### `leader` — Members focused on developing leadership and management skills

| Role | Weight (%) | Rationale |
|------|:----------:|-----------|
| Toastmaster | 30 | Highest leadership responsibility in a meeting |
| General Evaluator | 25 | Oversees the full meeting team — key leadership development |
| Table Topics Master | 20 | Facilitation and impromptu leadership |
| Evaluator | 15 | Providing constructive feedback is a core leadership skill |
| Speaker | 5 | Some public speaking is still valuable for leaders |
| Grammarian | 3 | Supporting role that builds attention to communication detail |
| Word of the Day Master | 1 | Minimal; vocabulary still beneficial |
| Timer | 1 | Minimal |
| Ah Counter | 0 | Not prioritized for leadership-focused members |
| **Total** | **100** | |

---

### `communicator` — Members focused on communication, language, and feedback skills

| Role | Weight (%) | Rationale |
|------|:----------:|-----------|
| Speaker | 25 | Consistent speaking practice reinforces communication skills |
| Evaluator | 20 | Providing feedback develops listening and analytical communication |
| Table Topics Master | 15 | Impromptu communication is a core communicator strength |
| Toastmaster | 12 | Meeting facilitation develops structured communication |
| Grammarian | 10 | Direct language and grammar practice |
| Word of the Day Master | 8 | Active vocabulary enrichment |
| General Evaluator | 5 | Broad evaluative communication |
| Timer | 3 | Minimal support role |
| Ah Counter | 2 | Builds active listening skills |
| **Total** | **100** | |

---

### `balanced` — Members who want broad exposure to all roles

| Role | Weight (%) | Rationale |
|------|:----------:|-----------|
| Speaker | 15 | Slightly higher — speaking practice benefits everyone |
| Toastmaster | 14 | Leadership is always valuable |
| Table Topics Master | 12 | Wide-benefit facilitation role |
| General Evaluator | 12 | Critical thinking and oversight |
| Evaluator | 12 | Feedback skills for everyone |
| Grammarian | 9 | Language and listening |
| Word of the Day Master | 9 | Vocabulary |
| Timer | 9 | Support and responsibility |
| Ah Counter | 8 | Listening and language awareness |
| **Total** | **100** | |

---

## Adjusting Weights

When the user wants to customize weights, enforce these rules:
1. All 9 roles must be included (even if weight is 0)
2. Weights must sum exactly to 100
3. No single role should exceed 50% (to ensure broad development)
4. Roles with weight 0 will never be assigned to that member

### Example Adjustment Conversation

> **Agent:** For Alice (public_speaker), the default gives Speaker=35% and Timer=3%. Would you like to adjust these?
>
> **User:** Give Alice more Toastmaster time — make it 30% and reduce Speaker to 25%.
>
> **Agent:** Updated weights for Alice: Speaker=25, Toastmaster=30, Table Topics Master=15, Evaluator=10, General Evaluator=5, Grammarian=5, Word of the Day Master=5, Timer=3, Ah Counter=2. Total=100 ✓

---

## Weight Override in `members.json`

Individual member weights override the goal-type defaults:

```json
{
  "members": [
    {
      "name": "Alice",
      "goal": "public_speaker",
      "pathway": "Confident Voice",
      "weights": {
        "Speaker": 25,
        "Toastmaster": 30,
        "Table Topics Master": 15,
        "Evaluator": 10,
        "General Evaluator": 5,
        "Grammarian": 5,
        "Word of the Day Master": 5,
        "Timer": 3,
        "Ah Counter": 2
      }
    }
  ]
}
```

Goal-level overrides (apply to all members with that goal) go in the top-level `weights` object.
Member-level overrides (for a specific member) go in the member's own `weights` field.
