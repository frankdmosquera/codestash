# GIT BASICS

Git is a version control system that allows you to track
changes in your code and collaborate with others
efficiently.

## Greta for:

- Staging Area
- Undoing Mistakes
- Integration with Other Tools
- Community and Support
- Standard in the Industry
- Version Control
- Collaboration
- Branching & Merging
- Distributed System
- Tracking Changes

## Git config

### git --version

### git config --global user.name

this is to check name, to change just add "name" like this git config --global user.name "heguer"

### git config --global user.email

## start a repo

### git init

Initializes a new Git repository. This command creates a
new Git repository in the current directory. It sets up the
basic files and directories needed to start tracking changes.

### git config --global init.defaultBranch main

That command sets the default branch name for new repositories you create. so now the new name should be main

#### fuller picture:

#### What it does:

Sets the name Git uses for the initial branch whenever you run git init on a new repo — instead of Git's older default (master), new repos will start with a branch called main.

#### Why it matters:

GitHub, GitLab, and most modern tooling default to main now, so this keeps your local setup consistent with what you'll push to.

#### Scope:

--global means it applies to every new repo you init on this machine going forward — it does not rename branches in repos you already created.
Verify it:

#### to check name

- `git config --global init.defaultBranch`

To check branch name

#### to change name

- from master to main `git branch -m master main`

## Work on the repo

### git status

so say we create a couple files in the tracked folder. it will show them as untracked files and ask if include them

### git add [file/directory]

prepares the changes for the next commit. this is to start tracking a file or directory.

### git add .

Adds everything in the repository (new files, modified files, and deletions). This is the command I use most often.

### `git add A`

Adds everything in the repository (new files, modified files, and deletions). This is the command I use most often.

### git commit -m "commit message"

Creates a new commit with a message describing the
changes made. This command creates a new commit with
the changes you made to your local repository.

### git log

This command shows a list of all commits in the repository.
It displays the author, date, and commit message for each
commit the repository has.
et the very bottom you can see something like tghis:
~
(END)
commit e36ad272b950404daa3e38fee01c0343d53119cb (HEAD -> master)
Author: heguerack <heguer76@gmail.com>
Date: Tue Aug 4 16:50:13 2026 -0600

    all all files at once, to be tracked

~
from here we can get the commit id

use the commit id from git log ; this command will take us tio that snapshot. so basically we are now at that poin of time

# GIT ADVANCED

## Moving to a diferent commit (DOM)

### git checkout e36ad272b950404daa3e38fee01c0343d53119cb

this will rtake us to that poin in time. so this is the snapshot

### git checkout f

lets say you are working on the project and you dont want those changes. so instead of going back to that commit we can say git checkout f to start over

## github

to work with other remotly. so far its been local dev. when we git init we initialize locally

### start a repo in git hub

make sure your local one is in main or master, fisrt.

### git remote add origin https://github.com/frankdmosquera/mastering-git.git

this is the fist line from here:
…or push an existing repository from the command line
git remote add origin https://github.com/frankdmosquera/mastering-git.git
git branch -M main
git push -u origin main

you can do all of them at once

## branching

### git branch

This command lists all the branches in the current
repository. It shows the current branch you're on and
highlights it with an asterisk.

### git branch new-branch

creates a new branch, but it wont take you there.

### git checkout new-branch

to go to hte newly created branch

### git checkout -b new-brach-name

this will create the branch and take u there. but remember its from that branch not from the main branch. so careful, depends on what u are doing

### git branch new-branch-name some-other-branch

this will make a branch froma selected branch; so no need to checkout or things like that

## local commits vs (cloud) github

### git push --set-upstream origin feature-branch

pushes to github; keeps things in sync` git push -u origin` feature-branch is an alternative

### git push

once linked, one can just write git push

### git pull

fetches changes fomt eh remorte repo. if someone makes changes on github; then this way you are up to date

## Merging back to Main

so to sync main so that it gets the changes or its upto date to feature-branch. so the idea is that once we work on the feature, we test, and we make sure all is good, just then we get main to be like feature-branch

- compare and pull requests or on the nav menu where it says pull requets
- new
- compare:feature-brand (from) to base:main
- it will show something like this: Showing `1 changed file` with 11 additions and 0 deletions.
- if everything is ok, click `create pull request`
- now the team lead or senior dev is ready to approve and click `Merge pull request`
- confirm merge
- so basically right now, we can delete the feature-branch as everything i in main.
- but here is the deal, locally we have that extra branch that we just deleted. and moreover we havent merged locally!! so that main gets the changes too locally
- so here we can just `git pull ` and thats all!! all the changes in github are now active locally!

## Typical workflow

- clone the repo
- create a new branch from the main or another branch
- make ur changes
- push the branch to the remote repo
- open a pull request
- merge the changes
- pull the merged changes into your local main branch
