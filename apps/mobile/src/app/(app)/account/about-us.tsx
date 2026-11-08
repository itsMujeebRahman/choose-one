import InformationPage from "../../../components/profile/information-page";

export default function AboutUsScreen() {
  return (
    <InformationPage
      title="About us"
      intro="A little less overthinking. A little more moving forward."
      sections={[
        {
          title: "Meet Choose One",
          body: "Choose One gives everyday decisions a little space. Name what’s on your mind, add your options, and use a pick as a starting point for your next step.",
        },
        {
          title: "Make room for the small things",
          body: "Keep reusable Choice Lists for the decisions that come around again, and revisit your history when you want to see your past choices.",
        },
        {
          title: "Your choice stays yours",
          body: "The app can offer a nudge, but you decide what feels right. You can pause, change your options, or choose a different direction.",
        },
      ]}
    />
  );
}
