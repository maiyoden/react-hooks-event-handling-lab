import React, { useState, useEffect } from 'react';

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    prompt: '',
    answers: ['', '', '', ''],
    correctIndex: 0,
  });

  useEffect(() => {
    fetch('http://localhost:4000/questions')
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error('Error fetching questions:', error));
  }, []);

  const handleInputChange = (e) => {
    setNewQuestion({ ...newQuestion, prompt: e.target.value });
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[index] = value;
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const handleCorrectIndexChange = (e) => {
    setNewQuestion({ ...newQuestion, correctIndex: parseInt(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestion),
    })
      .then((res) => res.json())
      .then((data) => {
        setQuestions([...questions, data]);
        setShowForm(false);
        setNewQuestion({
          prompt: '',
          answers: ['', '', '', ''],
          correctIndex: 0,
        });
      })
      .catch((error) => console.error('Error adding question:', error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setQuestions(questions.filter((q) => q.id !== id));
      })
      .catch((error) => console.error('Error deleting question:', error));
  };

  const handlePatchCorrectIndex = (id, correctIndex) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correctIndex }),
    })
      .then((res) => res.json())
      .then((updatedQuestion) => {
        setQuestions(
          questions.map((q) => (q.id === id ? updatedQuestion : q))
        );
      })
      .catch((error) => console.error('Error updating question:', error));
  };

  return (
    <div>
      <h1>Quiz Questions</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'New Question'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <label>
            Prompt:
            <input
              type="text"
              value={newQuestion.prompt}
              onChange={handleInputChange}
              required
            />
          </label>
          <br />
          {newQuestion.answers.map((answer, index) => (
            <label key={index}>
              Answer {index + 1}:
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                required
              />
            </label>
          ))}
          <br />
          <label>
            Correct Answer:
            <select
              value={newQuestion.correctIndex}
              onChange={handleCorrectIndexChange}
            >
              {newQuestion.answers.map((_, index) => (
                <option key={index} value={index}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>
          <br />
          <button type="submit">Add Question</button>
        </form>
      )}

      <h2>Questions List</h2>
      <ul>
        {questions.map((question) => (
          <li key={question.id}>
            <p>{question.prompt}</p>
            <ul>
              {question.answers.map((answer, index) => (
                <li key={index}>
                  {answer}{' '}
                  {index === question.correctIndex ? <strong>(Correct)</strong> : null}
                </li>
              ))}
            </ul>
            <label>
              Change Correct Answer:
              <select
                value={question.correctIndex}
                onChange={(e) =>
                  handlePatchCorrectIndex(question.id, parseInt(e.target.value))
                }
              >
                {question.answers.map((_, index) => (
                  <option key={index} value={index}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <button onClick={() => handleDelete(question.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionList;
