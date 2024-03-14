import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import io from "socket.io-client";
import styled from "styled-components";
import { resetSocket, setSocketId } from "../Helper/socketSlice.js";
import { Field, reduxForm } from "redux-form";

const Student = () => {
    const dispatch = useDispatch();
    const [pollData, setPollData] = useState(
        JSON.parse(sessionStorage.getItem("pollData")) || {
            question: {},
            options: [],
            answerTime: 0,
            isMultiAnswer: false,
        }
    );
    const [pollResult, setPollResult] = useState(
        JSON.parse(sessionStorage.getItem("pollResult")) || null
    );
    const [pollAnswer, setPollAnswer] = useState(
        JSON.parse(sessionStorage.getItem("pollAnswer")) || null
    );
    const [socket, setSocket] = useState(null);
    const [answerResponse, setAnswerResponse] = useState(
        JSON.parse(sessionStorage.getItem("answerResponse")) || null
    );
    const [selectedQuestionId, setSelectedQuestionId] = useState(
        JSON.parse(sessionStorage.getItem("selectedQuestionId")) || null
    );
    const [selectedOptionId, setSelectedOptionId] = useState(
        JSON.parse(sessionStorage.getItem("selectedOptionId")) || null
    );
    const [isSubmitted, setIsSubmitted] = useState(
        JSON.parse(sessionStorage.getItem("isSubmitted")) || false
    );
    const [timeRemaining, setTimeRemaining] = useState(0); // State for time remaining
    const [isTimerOver, setIsTimerOver] = useState(false); // State to track if timer is over

    useEffect(() => {
        const webSocketUrl = "http://localhost:8080";
        const newSocket = io(webSocketUrl);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            dispatch(setSocketId({ id: newSocket.id }));
        });

        newSocket.on("poll", (data) => {
            setPollData(data);
            setIsSubmitted(false);
            setTimeRemaining(data.answerTime); // Update time remaining when new poll is received
            setIsTimerOver(false); // Reset timer over state when new poll is received
        });

        newSocket.on("pollResult", (result) => {
            setPollResult(result);
        });

        newSocket.on("checkAnswer", (data) => {
            const answer = data?.responseObj?.data?.answer;
            if (data.responseObj) {
                if (Boolean(answer)) {
                    alert("The answer was correct.");
                } else {
                    alert("The answer was incorrect.");
                }
            }
            setAnswerResponse(data.pollResults);
            setIsTimerOver(true);
        });

        return () => {
            newSocket.disconnect();
            dispatch(resetSocket());
        };
    }, [dispatch]);

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            if (timeRemaining > 0 && !isSubmitted) {
                setTimeRemaining((prevTime) => prevTime - 1);
            } else {
                clearInterval(timer);
            }
        }, 1000);

        // Clear the timer when component unmounts or when the poll is submitted
        return () => clearInterval(timer);
    }, [timeRemaining, isSubmitted]);

    const checkAnswer = () => {
        const data = {
            question: selectedQuestionId,
            selectedOptions: selectedOptionId,
            answerTime: pollData.answerTime,
            isMultiAnswer: pollData.isMultiAnswer,
        };
        const question = document.getElementById("questions");
        if (question) {
            question.style.display = "none";
        }
        setPollData(null);
        setPollResult(null);
        setIsSubmitted(true);
        socket.emit("checkAnswer", data);
    };

    const selectAnswer = (optionId, questionId) => {
        setSelectedOptionId(optionId);
        setSelectedQuestionId(questionId);
    };

    return (
        <StudentStyled>
            {pollData ? (
                <div id="questions">
                    <h1>
                        Question:{" "}
                        {pollData.question && Object.keys(pollData.question)[0]}
                    </h1>
                    <h2>Time remaining: {timeRemaining} seconds</h2>{" "}
                    {/* Display timer */}
                    <ul>
                        {pollData?.options?.map((option, index) => (
                            <div key={index}>
                                <input
                                    type="checkbox"
                                    value={Object.keys(option)[0]}
                                    data-option-id={Object.keys(option)[0]}
                                    onChange={() =>
                                        selectAnswer(
                                            [option[Object.keys(option)[0]]],
                                            pollData.question[
                                                Object.keys(
                                                    pollData.question
                                                )[0]
                                            ]
                                        )
                                    }
                                />
                                <span> {Object.keys(option)[0]}</span>
                            </div>
                        ))}
                    </ul>
                    <div>
                        <button
                            type="button"
                            onClick={checkAnswer}
                            disabled={timeRemaining === 0} // Disable button when timer is 0
                        >
                            CheckAnswer
                        </button>
                    </div>
                </div>
            ) : (
                <h1>Waiting for new poll...</h1>
            )}
            {/* Rendering poll results when timer is over or after submitting the answer */}
            {(isTimerOver || isSubmitted) && pollResult?.options?.length ? (
                pollResult.options.map((item) => (
                    <div key={item.option}>
                        <ProgBarStyles>
                            <OptionStylesLeft>{item.option}</OptionStylesLeft>
                            <OptionStylesRight>{item.votes}</OptionStylesRight>
                        </ProgBarStyles>
                    </div>
                ))
            ) : (
                <div></div>
            )}
            {timeRemaining <= 0 &&
                !isSubmitted &&
                pollResult?.options &&
                pollResult?.options.map((item) => (
                    <div key={item.option}>
                        <ProgBarStyles>
                            <OptionStylesLeft>{item.option}</OptionStylesLeft>
                            <OptionStylesRight>{item.votes}</OptionStylesRight>
                        </ProgBarStyles>
                    </div>
                ))}

            {/* Rendering answer responses */}
            {answerResponse?.options?.length &&
            !pollResult?.options &&
            isSubmitted ? (
                answerResponse.options.map((item) => (
                    <div key={item.option}>
                        <ProgBarStyles>
                            <OptionStylesLeft>{item.option}</OptionStylesLeft>
                            <OptionStylesRight>{item.votes}</OptionStylesRight>
                        </ProgBarStyles>
                    </div>
                ))
            ) : (
                <div></div>
            )}

            {/* Rendering waiting message */}
            {answerResponse?.options.length ? (
                <button type="button">Waiting for new answer</button>
            ) : (
                <div></div>
            )}
        </StudentStyled>
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

const StudentStyled = styled.div`
    color: white;
    font-size: 2rem;
    text-align: center;
    margin-top: 2rem;
`;

const TimeUp = styled.div`
    color: red;
    font-size: 2rem;
    text-align: center;
    margin-top: 2rem;
`;

export default reduxForm({ form: "studentForm" })(Student);
