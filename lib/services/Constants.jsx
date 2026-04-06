import { Title } from "@radix-ui/react-dialog";
import { BriefcaseBusinessIcon, Calendar, Code2Icon, CrownIcon, LayoutDashboard, List, Puzzle, Settings, User2Icon, WalletCards } from "lucide-react";

export const SideBarOptions=[
    {
        name:'Dashboard',
        icon:LayoutDashboard,
        path:'/dashboard'
    },
     {
        name:'scheduled Interview',
        icon:Calendar,
        path:'/scheduled-interview'
    },
     {
        name:'All Interview',
        icon:List,
        path:'/all-interview'
    },
     {
        name:'Billing',
        icon:WalletCards,
        path:'/billing'
    },
     {
        name:'Settings',
        icon:Settings,
        path:'/settings'
    },
    
]
 
export const InterviewType =[
    {
        title:'Technical',
        icon:Code2Icon
    },
    {
        title:'Behavioral',
        icon:User2Icon
    },
    {
        title:'Experience',
        icon:BriefcaseBusinessIcon
    },
    {
        title:'Problem Solving',
        icon:Puzzle
    },
    {
        title:'Leadership',
        icon:CrownIcon
    },
]

export const QUESTIONS_PROMPT = `You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:
Job Title: {{jobTitle}}
Job Description: {{jobDescription}}
Interview Duration: {{duration}}
Interview Type: {{type}}
Your task:
Analyze the job description to identify key responsibilities, required skills, and expected experience.
Generate a list of interview questions depends on interview duration
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life {{type}} interview.
Format your response in JSON format with array list of questions.
format: interviewQuestions=[
{
question: "",
type: "Technical/Behavioral/Experince/Problem Solving/Leaseship"
}
]`;


export const FEEDBACK_PROMPT = `{{conversation}}

You are an AI interview evaluator. Analyze the user's interview responses in the provided conversation.

- Always provide feedback in **strict JSON format** as shown below.
- If the user did not respond or the conversation is empty, generate feedback indicating no answers were provided and score accordingly.

Respond strictly in this JSON format:

{
  "feedback": {
    "rating": {
      "technicalSkills": 5,
      "communication": 6,
      "problemSolving": 4,
      "experience": 7
    },
    "summary": "<3-line summary of performance, or note if no response>",
    "recommendation": false,
    "recommendationMsg": "<one-line message, or note if no response>"
  }
}`;
