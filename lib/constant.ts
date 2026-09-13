import { parseSize } from "./utils";

export const TRACK = "track";
export const ROOM = "room";

export const MAX_ATTACHMENT_UPLOAD_SIZE = parseSize("10MB");

export const layouts = {
  Slug: "slug",
  Page: "page",
} as const;

export const events = {
  Welcome: "welcome",
  Abstract: "abstract",
  Participant: "participant",
  Confirmation: "confirmation",
  Settings: "settings",

  // Pages
  Attachments: "attachments",
  Tasks: "tasks",
  Calendar: "calendar",
} as const;

export const portal = {
  // Portal tabs
  Home: "home",
  Submissions: "submissions",
  Profile: "profile",
  Tasks: "tasks",
  Files: "files",
} as const;

export const genericWelcome = `Welcome! We’re excited to hear from speakers who have ideas, experiences, and perspectives they’d like to share with our community. Whether you’re an experienced speaker or submitting a proposal for the first time, we’d love to learn what you have to offer.

## Before you begin

* **Tell us about your talk:** Share a clear idea, topic, or session you’d like to present.
* **Provide your details:** Make sure your speaker profile and contact information are accurate.
* **Take your time:** You can review your responses before submitting your proposal.
* **Submit before the deadline:** Proposals must be submitted before the CFP closes.

Please provide thoughtful and complete responses. The event team will use the information you provide to evaluate your proposal and plan the event.

Good luck, and we look forward to reading your submission!
`;

export const genericConclusion = `Thank you for your submission! Your proposal has been received and will be reviewed by the event team.

**What happens next**

* **Review:** The committee will review all submissions after the CFP closes.
* **Updates:** We’ll contact you by email with the outcome and any next steps.
* **While you wait:** You can review your submission or submit another proposal before the deadline, if applicable.

No action is required from you right now. We’ll be in touch when there’s an update.
`;

export const participantTemplate = `form {
  name: "Speaker Information"
  description: "Tell us about yourself so we can get to know you and contact you about your submission."

  text name "Full Name" {
    required(true);
    maxlength(2);
    placeholder("Your full name");
  }

  text email "Email Address" {
    required(true);
    placeholder("you@example.com");
  }

  text job_title "Job Title" {
    placeholder("e.g. Software Engineer");
  }

  text company "Company / Organization" {
    placeholder("Where do you currently work?");
  }

  longText bio "Short Bio" {
    required(true);
    maxlength(50);
    placeholder("Tell us briefly about yourself and your experience");
  }

  attachment headshot "Profile Picture" {
    accepts("*.{jpg,jpeg,png,webp}");
    maxsize("5MB");
    placeholder("Upload a clear profile picture");
  }

  text website "Website" {
    placeholder("https://yourwebsite.com");
  }

  text twitter "X / Twitter" {
    placeholder("@username");
  }

  text linkedin "LinkedIn" {
    placeholder("https://linkedin.com/in/username");
  }

  checkbox dietary_needs "Do you have any special dietary needs?" {
    required(true);
  }

  reference event.room "Preferred Event Room" {
    placeholder("Select your preferred room");
  }

  reference event.track "Preferred Event Track" {
    required(true);
    placeholder("Select the track that best matches your submission");
  }
}`;

export const proposalTemplate = `form {
  name: "Talk Proposal"
  description: "Tell us about the session you would like to present at the event."

  text title "Talk Title" {
    required(true);
    minlength(5);
    placeholder("Give your talk a clear and engaging title");
  }

  text abstract "Talk Abstract" {
    required(true);
    maxlength(100);
    placeholder("Describe what your talk is about and what attendees will learn");
  }

  text description "Detailed Description" {
    placeholder("Provide additional context about your session");
  }

  text audience "Target Audience" {
    placeholder("Who is this session intended for?");
  }

  text takeaways "Key Takeaways" {
    required(true);
    placeholder("What should attendees learn or be able to do after this talk?");
  }

  text duration "Expected Duration" {
    required(true);
    placeholder("e.g. 30 minutes");
  }

  checkbox interactive "Does this session include interactive activities?" {
    required(true);
  }

  checkbox workshop "Is this a workshop or hands-on session?" {
    required(true);
  }

  reference event.track "Event Track" {
    required(true);
    placeholder("Which track best fits this proposal?");
  }

  reference event.room "Preferred Room" {
    placeholder("What type of room would work best for this session?");
  }

  attachment slides "Presentation / Supporting Material" {
    accepts("*.{pdf,ppt,pptx}");
    maxsize("10MB");
    placeholder("Upload slides or supporting material");
  }

  attachment additional_material "Additional Material" {
    accepts("*.{pdf,doc,docx,ppt,pptx,zip}");
    maxsize("20MB");
    placeholder("Upload any additional material reviewers should see");
  }
}`;
