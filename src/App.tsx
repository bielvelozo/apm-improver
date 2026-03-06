import { useState } from "react";
import "./App.css";
import Table from "./components/table";

function App() {
  const [start, setStart] = useState(false);

  return (
    <>
      <h1>improve your apm lol skills</h1>
      <Table start={start} />
      <button onClick={() => setStart(true)}>Start</button>
    </>
  );
}

export default App;
