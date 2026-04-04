You can use this md to compile all the propmts you used
This file will be added to gitignore so it will not be pushed to the remote repository.

[date]
[Prompt]
[what files are affected]

![Prompt Viewable file](https://gemini.google.com/share/8c6e9af00700)

## `Date`: April 1, 2026 (04-01-26)

`Prompt`:

```I already have google cloud and supabase set-up. I have these pieces of code already. I'm using React, Typescript, and Tailwind's latest version.

--INSERT CODE--
src/App.css
src/App.tsx
index.css
main.tsx
components/compositesAuthComposites.tsx
components/elemetns/AuthElements.tsx
components/pages/LoginPage.tsx
components/pages/ReigsterPage.tsx
components/shells/AuthLayout.tsx
components/ThemeContext.tsx
---

I want to integrate the login/register in this code base. Analyse the code, tell me the step-by-step process of what to do, and explain why you did this process. Keep the code base clean.

```

`What files are affected`:

- package-lock.json/package.json → installed supabase
- created lib/supabase.ts
- AuthComposites.tsx
- App.tsx
- RegisterPage.tsx
- LoginPage.tsx
