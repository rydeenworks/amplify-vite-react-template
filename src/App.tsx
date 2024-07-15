
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function MyTodoPage() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  const fetchTodos = async () => {
    const { data: items } = await client.models.Todo.list();
    setTodos(items);
  };

  const { user, signOut } = useAuthenticator(
    (context) => {
      console.log("useAuthenticator onChanged. route=" + context.route + " authStatus=" + context.authStatus + " user:" + context.username);
      return [context.user];
    }
  );

  useEffect(() => {
    console.log("useEffect::user=" + user);
    if (user) {
      fetchTodos();
    }
    const subscribe = client.models.Todo.observeQuery().subscribe({
      next: (data) => {
        console.log("useEffect::Todo.observeQuery()>>>setTodos");
        setTodos([...data.items]);
      },
    });
    return () => {
      console.log("useEffect::unsubscribe()");
      subscribe.unsubscribe();
      setTodos([]);
    }
  }, [user]);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({id});
  }

  return (
    <Authenticator>
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <h1>My todos</h1>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li 
                onClick={()=>deleteTodo(todo.id)}
                key={todo.id}>{todo.content}
              </li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
          <button onClick={signOut}>Sign out</button>
        </main>
    </Authenticator>
  );  
}

export default function App() {
  return (
    <Authenticator.Provider>
      <MyTodoPage />
    </Authenticator.Provider>
  );
}
