import React from "react";
import Prompt from "./Prompt";
import { decode } from "html-entities";

export default function App() {
  const [start, setStart] = React.useState(false);
  const [gameNumber, setGameNumber] = React.useState(0);
  const [triviaData, setTriviaData] = React.useState([]);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (start) {
      fetch("https://opentdb.com/api.php?amount=5&type=multiple")
        .then((res) => res.json())
        .then((data) => {
          setTriviaData(processTriviaData(data.results));
        });
    }
  }, [start, gameNumber]);

  // console.log(triviaData)

  function reset() {
    setIsSubmitted(false);
    setGameNumber((prevGameNumber) => prevGameNumber + 1);
  }

  function submitAnswers() {
    if (isAllAnswersSelected()) {
      setIsSubmitted(true);
    } else {
      console.log("not all answers selected");
    }
  }

  function calculateTally() {
    return triviaData.reduce((acc, prompt) => {
      if (
        prompt.answers.some((answer) => {
          return answer.isSelected && answer.isCorrect;
        })
      ) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
  }

  function isAllAnswersSelected() {
    return triviaData.every((prompt) => {
      return prompt.answers.some((answer) => {
        return answer.isSelected;
      });
    });
  }

  function processTriviaData(triviaDataResult) {
    const questionsAndAnswers = triviaDataResult.map((result) => ({
      question: decode(result.question),
      answers: getShuffledAnswersArray(result),
    }));
    return questionsAndAnswers;
  }

  function getShuffledAnswersArray(triviaDataEntry) {
    const randomNumbersArray = getRandomNumbersArray(4);

    const answersIndexed = [
      {
        answerText: decode(triviaDataEntry.correct_answer),
        isCorrect: true,
        isSelected: false,
        answerIndex: randomNumbersArray[0],
      },
    ];

    for (let i = 0; i < 3; i++) {
      answersIndexed.push({
        answerText: decode(triviaDataEntry.incorrect_answers[i]),
        isCorrect: false,
        isSelected: false,
        answerIndex: randomNumbersArray[i + 1],
      });
    }

    const shuffledAnswersArray = answersIndexed.toSorted((a, b) => {
      return a.answerIndex - b.answerIndex;
    });

    return shuffledAnswersArray;
  }

  function getRandomNumbersArray(arrayLength) {
    const randomNumbersArray = [];

    while (randomNumbersArray.length < arrayLength) {
      const newRandomNumber = Math.floor(Math.random() * arrayLength);

      if (!randomNumbersArray.includes(newRandomNumber)) {
        randomNumbersArray.push(newRandomNumber);
      }
    }
    return randomNumbersArray;
  }

  const prompts = triviaData.map((prompt, index) => {
    return (
      <Prompt
        key={index}
        question={prompt.question}
        answers={prompt.answers}
        handleClick={setTriviaData}
        isSubmitted={isSubmitted}
      />
    );
  });

  return (
    <main>
      {start ? (
        <div className="gamePage">
          {prompts}
          {isSubmitted ? (
            <div className="resultsPrompt">
              <p>You scored {calculateTally()}/5 answers</p>
              <button className="gameButton playAgainButton" onClick={reset}>
                Play Again
              </button>
            </div>
          ) : (
            <button
              className="gameButton checkAnswersButton"
              onClick={submitAnswers}
            >
              Check Answers
            </button>
          )}
        </div>
      ) : (
        <div className="introPage">
          <h1 className="introPageTitle">Quizzical</h1>
          <p className="introPageDescription">Test your trivia mettle</p>
          <button
            className="introPageButton"
            onClick={() => {
              setStart(true);
            }}
          >
            Start Quiz
          </button>
        </div>
      )}
    </main>
  );
}
