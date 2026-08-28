import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { db } from "./db";
import { barbershops, users } from "./db/schema";
import cookieParser from "cookie-parser";
import path from "node:path";

const app = express();
const publicPath = path.join(__dirname, "public");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(publicPath));

app.get("/", (request: Request, response: Response) => {
  return response.sendFile("index.html", {
    root: "src/public",
  });
});

app.post("/users", async (request: Request, response: Response) => {
  const { email, password } = request.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    });

  response.cookie("userId", String(user.id), {
    httpOnly: false,
    sameSite: "lax",
  });

  return response.status(201).json(user);
});

app.get("/users", async (request: Request, response: Response) => {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users);

  return response.json(result);
});

app.get("/users/:id", async (request: Request, response: Response) => {
  const id = Number(request.params.id);

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id));

  if (!user) {
    return response.status(404).json({
      message: "User not found",
    });
  }

  return response.json(user);
});

app.put("/users/:id", async (request: Request, response: Response) => {
  const id = Number(request.params.id);
  const { email, password } = request.body;

  const data: {
    email?: string;
    password?: string;
  } = {};

  if (email) {
    data.email = email;
  }

  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    });

  if (!user) {
    return response.status(404).json({
      message: "User not found",
    });
  }

  return response.json(user);
});

app.delete("/users/:id", async (request: Request, response: Response) => {
  const id = Number(request.params.id);

  const [user] = await db.delete(users).where(eq(users.id, id)).returning({
    id: users.id,
  });

  if (!user) {
    return response.status(404).json({
      message: "User not found",
    });
  }

  return response.status(204).send();
});

app.post("/barbershops", async (request: Request, response: Response) => {
  const { name } = request.body;

  const userId = request.cookies.userId;

  if (!userId) {
    return response.status(401).json({
      message: "User not authenticated",
    });
  }

  const [barbershop] = await db
    .insert(barbershops)
    .values({
      name,
      userId: Number(userId),
    })
    .returning();

  return response.status(201).json(barbershop);
});

app.get("/barbershops", async (request: Request, response: Response) => {
  const result = await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      userId: barbershops.userId,
      createdAt: barbershops.createdAt,
    })
    .from(barbershops);

  return response.json(result);
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
