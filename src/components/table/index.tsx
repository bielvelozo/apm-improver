import { useCallback, useEffect, useState } from "react";
import styles from "./styles.module.scss";

export default function Table(start: { start: boolean }) {
  const initialRows = [
    {
      id: 1,
      cells: {
        1: "",
        2: "",
        3: "",
        4: "",
      },
    },
    {
      id: 1,
      cells: {
        1: "",
        2: "",
        3: "",
        4: "",
      },
    },
    {
      id: 1,
      cells: {
        1: "",
        2: "",
        3: "",
        4: "",
      },
    },
    {
      id: 1,
      cells: {
        1: "",
        2: "",
        3: "",
        4: "",
      },
    },
  ];

  function generateKeys() {
    const letters = ["E", "W", "Q", "R", "D", "F"];

    const result = [];

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      const letter = letters[randomIndex];

      const row = Math.floor(Math.random() * rows.length) + 1;
      const cell =
        Math.floor(Math.random() * Object.keys(rows[row - 1].cells).length) + 1;

      result.push({
        letter: letter,
        row,
        cell,
      });
    }

    return result;
  }
  const [rows, setRows] = useState(initialRows);
  const [actualKeys, setActualKeys] = useState<
    { letter: string; row: number; cell: number }[]
  >([]);

  useEffect(() => {
    if (start.start) {
      const interval = setInterval(() => {
        const newKeys = generateKeys();
        setActualKeys(newKeys);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [start]);

  useEffect(() => {
    const newRows = [...initialRows];
    actualKeys.forEach(({ letter, row, cell }) => {
      newRows[row - 1].cells[cell as keyof (typeof newRows)[0]["cells"]] =
        letter;
    });

    setRows(newRows);
  }, [actualKeys]);

  const renderRows = useCallback(() => {
    return rows.map((row) => {
      return (
        <div className={styles.row} key={row.id}>
          {Object.entries(row.cells).map(([key, value]) => (
            <div className={styles.cell} key={key}>
              {value}
            </div>
          ))}
        </div>
      );
    });
  }, [rows]);

  return <div className={styles.container}>{renderRows()}</div>;
}
