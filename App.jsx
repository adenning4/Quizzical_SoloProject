import React from "react";
import Prompt from "./Prompt";
import { decode } from "html-entities";

export default function App() {
  const [start, setStart] = React.useState(false);
  const [gameNumber, setGameNumber] = React.useState(0);
  const [triviaData, setTriviaData] = React.useState(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [prompts, setPrompts] = React.useState(null);

  // include sad path behavior
  React.useEffect(() => {
    if (start) {
      fetch("https://opentdb.com/api.php?amount=5&type=multiple")
        .then((res) => res.json())
        .then((data) => {
          setTriviaData(processTriviaData(data.results));
        });
    }
  }, [start, gameNumber]);

  // don't need to re-render prompts that don't change! any time an answer is clicked, all prompts are re-rendering, although this isn't needed. May simplify structure to update this
  React.useEffect(() => {
    if (triviaData) {
      setPrompts(
        triviaData.map((prompt, index) => {
          return (
            <Prompt
              key={index}
              question={prompt.question}
              answers={prompt.answers}
              handleClick={setTriviaData}
              isSubmitted={isSubmitted}
            />
          );
        })
      );
    }
  }, [triviaData, isSubmitted]);

  // Refactor with dedicated components
  return (
    <main>
      {start ? (
        <div className="gamePage">
          {prompts || <h2>Loading questions...</h2>}
          {isSubmitted ? (
            <div className="resultsPrompt">
              <p>You scored {calculateTally()}/5 answers</p>
              <button className="gameButton playAgainButton" onClick={reset}>
                Play Again
              </button>
            </div>
          ) : (
            <button
              className={`gameButton checkAnswersButton ${
                prompts ? "" : "hide"
              }`}
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

  function reset() {
    setPrompts(null);
    setTriviaData(null);
    setIsSubmitted(false);
    setGameNumber((prevGameNumber) => prevGameNumber + 1);
  }

  function submitAnswers() {
    if (isAllAnswersSelected()) {
      setIsSubmitted(true);
    } else {
      // console.log("not all answers selected");
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
    const allAnswersArray = [
      triviaDataEntry.correct_answer,
      ...triviaDataEntry.incorrect_answers,
    ];
    const randomNumbersArray = getRandomNumbersArray(allAnswersArray.length);

    const answersIndexed = [];
    allAnswersArray.forEach((answer, index) => {
      answersIndexed.push({
        answerText: decode(answer),
        isCorrect: index ? false : true,
        isSelected: false,
        answerIndex: randomNumbersArray[index],
      });
    });

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
}
