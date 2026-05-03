# Backend Contract for Frontend Agents

This document is the source of truth for how the frontend should call the backend, what each endpoint returns, and which routes are restricted.

## 1. Authentication Model

There are two login paths:

1. Password login for `Admin`, `DepChair`, and `Dean`
2. Magic-link login for `Faculty`

### Password Login

Endpoint:
`POST /auth/login`

Behavior:
- Uses local auth with email and password.
- Returns a JWT access token.
- The frontend must store the token and send it on later requests in the `Authorization` header.

Response shape:
```json
{
  "access_token": "jwt-here"
}
```

### Magic-Link Login

Endpoint:
`GET /magic-links/validate/:token`

Behavior:
- Validates the token hash.
- Returns a JWT plus workflow context.
- The JWT payload includes `token_id` so the backend can invalidate the magic-link token after it is used.

Response shape:
```json
{
  "access_token": "jwt-here",
  "purpose": "NOMINATION | EVALUATION",
  "user_id": 123,
  "token_id": 456,
  "reference_id": 789
}
```

Frontend handling rules:
- Store the JWT from `access_token`.
- Store `purpose`, `user_id`, `token_id`, and `reference_id` in frontend state if you need to route the user to the correct workflow.
- For faculty task flows, the `token_id` is required in the JWT so the backend can mark the token as used.

### Request Header

All protected routes must send:
```http
Authorization: Bearer <access_token>
```

## 2. Roles

The backend uses role-based access control.

Available roles:
- `Faculty`
- `DepChair`
- `Dean`
- `Admin`

Rules:
- `Admin` manages users, questions, question sections, and evaluation cycles.
- `Faculty` submits nominations and answers using magic-link login.
- `DepChair` reviews nominations and signs summaries.
- `Dean` signs summaries after chair signature.

## 3. Restricted Endpoints

### Auth
- `POST /auth/login` - public, password login only
- `GET /magic-links/validate/:token` - public, magic-link validation only

### Users
- `POST /users` - `Admin` only
- `GET /users` - `Admin` only
- `PATCH /users/:id` - `Admin` only
- `GET /users/faculty` - authenticated users with any role

### Question Sections
- `POST /question-sections` - `Admin` only
- `GET /question-sections` - `Admin` only
- `GET /question-sections/:id` - `Admin` only
- `PATCH /question-sections/:id` - `Admin` only
- `DELETE /question-sections/:id` - `Admin` only
- `GET /question-sections/:id/questions` - `Admin` only

### Questions
- `POST /questions` - `Admin` only
- `GET /questions` - `Admin` only
- `PATCH /questions/:id` - `Admin` only
- `GET /questions/active` - authenticated users
- `GET /questions/sections/:sectionId` - `Admin` only
- `GET /questions/with-sections` - `Admin` only

### Evaluation Cycles
- `POST /evaluation-cycles` - `Admin` only
- `GET /evaluation-cycles` - `Admin` only
- `PATCH /evaluation-cycles/:id` - `Admin` only

### Nominations
- `POST /nominations/submit` - `Faculty` only
- `GET /nominations/pending-approval` - `DepChair` only
- `PATCH /nominations/review` - `DepChair` only

### Answers
- Answer submission is protected by JWT and uses the magic-link token context.
- The frontend should treat evaluation submission as a faculty-only workflow.

### Evaluation Summaries
- `GET /evaluation-summaries/pending-signature` - `DepChair` and `Dean`
- `PATCH /evaluation-summaries/:id/sign` - `DepChair` and `Dean`
- `GET /evaluation-summaries/faculty/:id` - `DepChair` and `Dean`
- `GET /evaluation-summaries/my-summaries` - `Faculty` only
- `GET /evaluation-summaries/:id/pdf-data` - authenticated users, role-checked by backend
- `GET /evaluation-summaries/:id/pdf-structure` - authenticated users, role-checked by backend

## 4. Important Workflow Rules

### Faculty Nomination Flow
1. Faculty opens magic-link.
2. Frontend calls `GET /magic-links/validate/:token`.
3. Backend returns JWT plus workflow context.
4. Frontend stores the token and routes faculty to the nomination form.
5. Faculty submits exactly 5 evaluator IDs.
6. Backend invalidates the magic-link token after successful use.

### Faculty Evaluation Flow
1. Faculty opens their evaluation magic-link.
2. Frontend validates the link.
3. Frontend uses the returned JWT and `token_id` to submit answers.
4. Backend marks the evaluation completed and invalidates the token.
5. If all required evaluations for that faculty member and cycle are complete, the backend generates the summary payload automatically.

### Chair Review Flow
1. Chair loads `GET /nominations/pending-approval`.
2. Chair must approve at least 3 evaluators before the review can be saved.
3. Approved nominations are turned into evaluation records.
4. The workload limit is checked against the active cycle before evaluations are created.

### Summary Signing Flow
1. Chair signs first.
2. Dean can sign only after chair signature exists.
3. Faculty can only see summaries after both signatures are present.

## 5. Data Shapes the Frontend Should Expect

### 5.1 Users
User objects returned by admin and faculty endpoints typically include:
```json
{
  "user_id": 1,
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "role": "Faculty"
}
```

### 5.2 Question Sections
```json
{
  "id": 1,
  "name": "Scholarship",
  "order": 1,
  "questions": [
    {
      "question_id": 10,
      "question_text": "...",
      "type": "LIKERT",
      "section_id": 1,
      "order_in_section": 1
    }
  ]
}
```

### 5.3 Questions
```json
{
  "question_id": 10,
  "question_text": "...",
  "type": "LIKERT",
  "is_required": true,
  "is_active": true,
  "section_id": 1,
  "order_in_section": 1,
  "section": {
    "id": 1,
    "name": "Scholarship",
    "order": 1
  }
}
```

### 5.4 Pending Nominations Grouped by Evaluatee
`GET /nominations/pending-approval` returns grouped data:
```json
[
  {
    "evaluatee_id": 12,
    "evaluatee_name": "Faculty Name",
    "evaluatee_email": "faculty@example.com",
    "nominations": [
      {
        "nomination_id": 100,
        "evaluatee_id": 12,
        "evaluator_id": 21,
        "status": "PENDING"
      }
    ]
  }
]
```

### 5.5 Summary PDF Data
`GET /evaluation-summaries/:id/pdf-data` and `GET /evaluation-summaries/:id/pdf-structure` return a PDF-friendly object with:
- evaluated faculty name
- cycle year
- total average
- satisfactory flag
- peer columns
- section statistics
- per-question responses
- open-ended comments
- signature metadata

The frontend should not recompute these values unless it is rendering a preview. Use the backend payload as the source of truth.

Example structure:
```json
{
  "summary_id": 1,
  "cycle_year": 2026,
  "evaluatee_name": "Faculty Name",
  "total_average": "4.12",
  "is_satisfactory": true,
  "peer_columns": [
    {
      "index": 1,
      "evaluator_id": 21,
      "evaluator_name": "Peer One",
      "label": "Peer 1"
    }
  ],
  "sections": [
    {
      "section_id": 1,
      "section_name": "Scholarship",
      "average_score": "4.33",
      "standard_deviation": "0.58",
      "questions": [
        {
          "question_id": 10,
          "question_text": "...",
          "question_type": "LIKERT",
          "order_in_section": 1,
          "peer_scores": [4, 5, 4],
          "average_score": "4.33"
        }
      ]
    }
  ],
  "open_ended_comments": [
    {
      "question_id": 99,
      "question_text": "Any comments about the faculty being evaluated:",
      "comments": [
        {
          "evaluator_id": 21,
          "evaluator_name": "Peer One",
          "text_response": "Great collaborator.",
          "visibility": "chair_only"
        }
      ]
    }
  ],
  "signatures": {
    "chair_sign_id": 5,
    "dean_sign_id": 8,
    "chair_signed_by": "Chair Name",
    "dean_signed_by": "Dean Name"
  },
  "document_url": null
}
```

## 6. What the Frontend Should Do With This File

1. Read this file before wiring UI flows.
2. Treat the endpoint list and roles as the access policy.
3. Treat the JSON shapes as contracts, not suggestions.
4. If the backend changes, update this document first or in the same PR.
5. For PDF rendering, use `pdf-data` or `pdf-structure` instead of trying to reconstruct the report from raw answers.

## 7. Notes for Future PDF Rendering

The backend is already preparing the data needed for the PDF layout. The actual PDF generator can be added later without changing the frontend contract if this document stays stable.

Recommended future rule:
- frontend uses `pdf-structure` for layout rendering
- backend eventually adds a real export endpoint that writes the file and returns `document_url`

