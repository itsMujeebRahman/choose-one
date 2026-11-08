import InformationPage from "../../../components/profile/information-page";

export default function TermsScreen() {
  return (
    <InformationPage
      title="Terms and conditions"
      intro="A few ground rules for using Choose One."
      sections={[
        {
          title: "Using Choose One",
          body: "Choose One is a tool for organizing options and exploring everyday choices. Use it lawfully and responsibly. Do not interfere with the service, attempt unauthorized access, or use it to harm others.",
        },
        {
          title: "Your decisions",
          body: "You remain responsible for the decisions you make. A pick is a suggestion, not a guarantee of a suitable outcome. Choose One does not provide professional medical, legal, or financial advice.",
        },
        {
          title: "Your account",
          body: "Keep access to your sign-in account secure. Guest sessions may become inaccessible if their stored credentials are lost or cleared; they do not offer the same recovery options as a linked sign-in account.",
        },
        {
          title: "Content you add",
          body: "Only add names, pictures, and other content you have the right to use. Avoid entering confidential information about yourself or others. You are responsible for the content you submit.",
        },
        {
          title: "Availability and changes",
          body: "Features may change, and the service may be temporarily unavailable for maintenance or technical reasons. Keep a separate copy of information you need to retain.",
        },
      ]}
    />
  );
}
