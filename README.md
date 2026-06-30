This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Git Multi-Push Setup

This project is configured so that **one `git push` updates multiple GitHub repositories**.

## Current Remotes

- `origin` → Main repository (also used for multi-push)
- `z`
- `a`
- `embed`
- `cdn`

Individual pushes still work:

```bash
git push z
git push a
git push embed
git push cdn
```

---

## How Multi-Push Works

Git allows a remote to have **multiple push URLs**.

The important command is:

```bash
git remote set-url --add --push origin <repository-url>
```

Explanation:

- `set-url` → Modify the remote URL.
- `--add` → Add another URL instead of replacing the current one.
- `--push` → Modify the push destination(s), not the fetch URL.
- `origin` → The remote being configured.

Because of `--add --push`, every `git push` to `origin` is sent to every configured repository.

---

## Current Configuration

```bash
git remote set-url --add --push origin https://github.com/j61202287/z.git

git remote set-url --add --push origin https://github.com/zxcprime/a.git

git remote set-url --add --push origin https://github.com/zxcprime-main/embed.git

git remote set-url --add --push origin https://github.com/zxcprime363-sys/cdn.git

git remote set-url --add --push origin https://github.com/daedalus404notfound/fffggg.git
```

---

## Daily Workflow

```bash
git add .
git commit -m "Your commit message"
git push
```

A single `git push` updates all configured repositories.

---

## Push to Only One Repository

```bash
git push origin
```

Pushes to **all** configured repositories.

```bash
git push z
```

Pushes only to the `z` repository.

```bash
git push a
```

Pushes only to the `a` repository.

```bash
git push embed
```

Pushes only to the `embed` repository.

```bash
git push cdn
```

Pushes only to the `cdn` repository.

---

## View the Current Multi-Push Configuration

Show all push URLs:

```bash
git remote get-url --all --push origin
```

Or:

```bash
git config --get-all remote.origin.pushurl
```

---

## Remove a Push URL

```bash
git remote set-url --delete --push origin <repository-url>
```

Example:

```bash
git remote set-url --delete --push origin https://github.com/j61202287/z.git
```

---

## Summary

- `git push` → Pushes to every `pushurl` configured for `origin`.
- `git push origin` → Also pushes to every configured `pushurl`.
- `git push z` → Pushes only to `z`.
- `git push a` → Pushes only to `a`.
- `git push embed` → Pushes only to `embed`.
- `git push cdn` → Pushes only to `cdn`.

The feature that makes this work is **multiple push URLs**, configured using:

```bash
git remote set-url --add --push origin <repository-url>
```
