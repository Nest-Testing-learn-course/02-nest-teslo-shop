---
name: git-commit-and-push
description: >
  This skill processes a single git repository.
  It checks for changes, creates a structured commit message with a type
  and a list of updated files, then commits and pushes those changes.
---

steps:

- name: process-repository
  run: |
  For the repository:
  - Print a separator and indicate that the repository is being processed.
  - Detect the current branch.
  - Pull the latest changes from the remote using rebase.
    - If conflicts occur during rebase:
      - Stop and notify the user that conflicts need to be resolved manually
      - Provide instructions on how to resolve conflicts
      - Exit the skill gracefully to allow manual intervention

  - Check if there are any uncommitted changes.
    - If there are changes:
      - List all modified files.
      - Build a bullet list describing each updated file.
      - Determine the type of change (fix, feat, test, build, ci, perf, style, docs, revert or chore)
        based on file names.
      - Stage all changes.
      - Create a commit using this format:

        type: <general-description> "<repository-name>"
        - change 1 description
        - change 2 description
        - change 3 description
        - etc...

      - Push the changes to the current branch.

    - If there are no changes:
      - Print that there are no changes in the repository.

- name: done
  run: |
  Print a final message indicating that the repository is up to date with a general description of the changes.
