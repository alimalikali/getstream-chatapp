# getStream.io Integration

A lightweight chat application built with Next.js, MongoDB, and [Stream Chat](https://getstream.io).  
This project was created to test and demonstrate GetStream integration with a Next.js stack.  
It includes authentication, basic 1:1 messaging, and a small set of reusable UI components.

## Quick Start

1. Create a `.env.local` file with the following variables:
   - `NEXT_PUBLIC_STREAM_KEY`
   - `STREAM_SECRET`
   - `MONGODB_URI`
   - `JWT_SECRET`

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
