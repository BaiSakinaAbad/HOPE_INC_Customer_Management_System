# HOPE_INC_Customer_Management_System
Follow these steps to set up your local environment.
### Setup Instructions
1. **Clone the repo**: `https://github.com/BaiSakinaAbad/HOPE_INC_Customer_Management_System.git`
2. **Enter directory**: `cd hopecms`
3. **Install dependencies**: `npm install`
4. **Configure environment variables**: Create a `.env` file in the root of the project and add the following keys:
```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
   > Ask M3 (Peja) or M4 (Vinz) for these keys.
5. **Run the project**: `npm run dev`
6. **Run the tests**: `npm run test`

### Environment Check
Once the browser opens after running `npm run dev`, you should see a **sleek, dark-themed split-screen login page**:
- The **left side** displays **"Customer Management System"** along with a chart graphic.
- The **right side** displays a **"Welcome back"** login form with **Google** and **Email** authentication options.

> ⚠️ If the page looks like plain, unstyled HTML instead of the dark-themed layout described above, verify your Tailwind installation and check that your `App.css` includes `@import "tailwindcss";`.

## 🔗 Project Resources
- **Supabase Project URL:** [Insert Supabase Dashboard Link Here]

# IMPORTANT
make sure the branch you are cloning is the dev branch and not main branch. When Pull request, make sure to read the guidelines in .github/Branch_Prreq_Guide.md

When you create your own branch, use a meaningful branch name and always git pull origin dev to make sure you pull any latest update in dev. 
Make sure you always push on your own branch and on github, create a pull request to dev branch.