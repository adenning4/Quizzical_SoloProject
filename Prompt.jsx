import React from "react";

export default function Prompt(props) {
  // refactor for simplicity/clarity this is tightly coupled?
  // Changes the isSelected property for a selected answer
  // Resets other isSelected properties to false for the question
  function handleAnswerButtonClick(selectedAnswer) {
    // too complicated to reset all of trivia data based on an answer click
    props.handleClick((prevTriviaData) => {
      return prevTriviaData.map((prompt) => {
        if (prompt.question === props.question) {
          const newAnswers = prompt.answers.map((answer) => {
            if (answer.answerText === selectedAnswer) {
              return {
                ...answer,
                isSelected: !answer.isSelected,
              };
            } else {
              return {
                ...answer,
                isSelected: false,
              };
            }
          });
          return { ...prompt, answers: newAnswers };
        } else {
          return prompt;
        }
      });
    });
  }

  // refactor for clarity? short circuit?
  function getButtonProperties(props, answer) {
    if (props.isSubmitted) {
      if (answer.isSelected && !answer.isCorrect) {
        return {
          disabled: true,
          classes: "submittedIncorrect",
        };
      } else if (answer.isCorrect) {
        return {
          disabled: true,
          classes: "submittedCorrect",
        };
      } else {
        return {
          disabled: true,
          classes: "submittedUnselected",
        };
      }
    } else {
      if (answer.isSelected) {
        return {
          disabled: false,
          classes: "unsubmittedSelected",
        };
      } else {
        return {
          disabled: false,
          classes: "unsubmittedUnselected",
        };
      }
    }
  }

  const answerElements = props.answers.map((answer, index) => {
    const buttonProperties = getButtonProperties(props, answer);

    return (
      <button
        key={index}
        disabled={buttonProperties.disabled}
        className={`answer ${buttonProperties.classes}`}
        onClick={() => {
          handleAnswerButtonClick(answer.answerText);
        }}
      >
        {answer.answerText}
      </button>
    );
  });

  return (
    <div className="prompt">
      <p className="question">{props.question}</p>
      {answerElements}
    </div>
  );
}
