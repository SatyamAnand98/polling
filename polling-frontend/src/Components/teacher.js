import React, { useEffect, useState } from "react";
import { Field, FieldArray, reduxForm } from "redux-form";
import styled from "styled-components";
import io from "socket.io-client";

const onSubmit = async (values) => {
    const apiUrl = "http://localhost:8080/create/poll";

    if (!values.question) {
        alert("Error: Question is required");
        return;
    }

    if (values.timer && (values.timer < 5 || values.timer > 240)) {
        alert("Error: Timer must be between 60 and 240 seconds");
        return;
    }

    if (!values.options || values.options.length < 2) {
        alert("Error: At least two options are required");
        return;
    }

    const formattedData = {
        question: values.question,
        options: values.options.reduce((acc, option, index) => {
            acc[option.text] = option.isCorrect || false;
            return acc;
        }, {}),
        answerTime: values.timer || 120,
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
            alert("Error:", response.statusText);
        } else {
            alert("Question Broadcasted Successfully!");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
};

const renderField = ({ input, label, type, meta: { touched, error } }) => (
    <RenderStyled>
        <div>
            <label>{label} </label>
            <input {...input} type={type} />
            {touched && error && <span>{error}</span>}
        </div>
    </RenderStyled>
);

const getAlphabet = (index) => String.fromCharCode(65 + index);

const renderOptions = ({ fields }) => (
    <OptionsStyled>
        {fields.map((option, index) => (
            <div className="option" key={index}>
                <div className="option-inputs">
                    <Field
                        name={`${option}.text`}
                        type="text"
                        component={renderField}
                        label={`${getAlphabet(index)}`}
                    />
                    <Field
                        name={`${option}.isCorrect`}
                        type="checkbox"
                        component={renderField}
                    />
                    <RenderStyled>
                        <div>
                            <button
                                type="button"
                                onClick={() => fields.remove(index)}
                            >
                                Remove
                            </button>
                        </div>
                    </RenderStyled>
                </div>
            </div>
        ))}
        <button type="button" onClick={() => fields.push({})}>
            Add Option
        </button>
    </OptionsStyled>
);

const TeacherForm = ({ handleSubmit }) => {
    const [pollResult, setPollResult] = useState(
        JSON.parse(sessionStorage.getItem("pollResult")) || null
    );
    const [addingQuestion, setAddingQuestion] = useState(false);

    useEffect(() => {
        const webSocketUrl = "http://localhost:8080";
        const newSocket = io(webSocketUrl);

        newSocket.on("connect", () => {});

        newSocket.on("pollResult", (result) => {
            setPollResult(result);
        });

        return () => {
            newSocket.disconnect();
            setPollResult(null);
        };
    }, []);

    const handleAddQuestion = () => {
        setAddingQuestion(true);
        sessionStorage.clear();
        setPollResult(null);
    };

    const handleCancelAddQuestion = () => {
        setAddingQuestion(false); // Resetting addingQuestion state
    };

    return (
        <TeacherFormStyled>
            <h2>Teacher's Form</h2>
            {!addingQuestion && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Field
                        className="question-input"
                        name="question"
                        type="text"
                        component={renderField}
                        label="Question"
                        textarea
                    />
                    <Field
                        className="timer"
                        name="timer"
                        type="number"
                        component={renderField}
                        label="Timer"
                        min={5}
                        max={240}
                    />
                    <FieldArray name="options" component={renderOptions} />
                    <button type="submit">Submit</button>
                </form>
            )}
            {addingQuestion && (
                <div>
                    <h3>Add a new question</h3>
                    <button onClick={handleCancelAddQuestion}>Cancel</button>
                </div>
            )}
            {pollResult?.options?.length &&
                pollResult.options.map((item) => (
                    <div key={item.option}>
                        <ProgBarStyles>
                            <OptionStylesLeft>{item.option}</OptionStylesLeft>
                            <OptionStylesRight>{item.votes}</OptionStylesRight>
                        </ProgBarStyles>
                    </div>
                ))}
            {!addingQuestion && (
                <button onClick={handleAddQuestion}>Add New Question</button>
            )}
        </TeacherFormStyled>
    );
};

const OptionStylesLeft = styled.span``;

const OptionStylesRight = styled.span`
    margin-left: 50vw;
`;

const ProgBarStyles = styled.span`
    border-radius: 10px;
    border: 2px solid #eee;
    width: 60vw;
    height: 60px;
    margin: 0 auto;
    margin-bottom: 20px;
    display: inline-block;
    padding-left: 10px;
    text-align: left;
`;

const TeacherFormStyled = styled.div`
    color: #ffffff;
    font-size: 2rem;
    text-align: center;
    margin-top: 2rem;
    background-color: #886f90;

    h2 {
        color: #ad8752;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1rem;

        .question-input {
            width: 10%;
            height: 3em;
            padding: 0.2rem;
            border-radius: 5px;
            border: none;
            margin-left: 0.5rem;
        }

        button {
            margin-top: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    }
`;

const OptionsStyled = styled.div`
    .option {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .option-inputs {
            display: flex;
            justify-content: space-between;
            flex-direction: row;
            align-items: center;
            padding: 0.5rem;
            border-radius: 5px;
        }

        button {
            background-color: #dc3545;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 0.5rem;
        }
    }

    button:last-child {
        margin-top: 0.5rem;
    }
`;

export const RenderStyled = styled.div`
    color: white;
    text-align: center;

    div {
        margin-bottom: 1rem;

        label {
            font-size: 1rem;
        }

        input {
            padding: 0.2rem;
            border-radius: 5px;
            border: none;
            margin-left: 0.5rem;
        }

        span {
            color: red;
        }

        textarea {
            padding: 0.2rem;
            resize: vertical;
            width: 100%;
            border-radius: 5px;
            border: none;
            margin-left: 0.5rem;
        }
    }
`;

export default reduxForm({
    form: "teacherForm",
})(TeacherForm);
