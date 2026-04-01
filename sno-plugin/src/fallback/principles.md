# sno Design Principles (Bundled Fallback)

These are the core principles used when the full sync has not yet completed.

## Smallest Diff
Every change should be the smallest correct diff. Do not gold-plate. Do not refactor beyond what the task requires.

## Principle of Least Astonishment (PoLA)
Code should behave the way a reasonable developer would expect. No surprises.

## Domain-Driven Design (DDD)
Model the domain first. Let the ubiquitous language drive naming, boundaries, and module structure.

## Fifth Normal Form (5NF)
Data models should eliminate redundancy. Every join dependency is implied by candidate keys.

## Spec-Driven Development
Write a spec before writing code. The spec is the contract — build exactly what it says.

## Test What Matters
Write tests for behavior, not implementation. Cover the acceptance criteria from the spec.
