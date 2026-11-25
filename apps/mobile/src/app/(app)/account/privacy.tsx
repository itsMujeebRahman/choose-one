import InformationPage from "../../../components/profile/information-page";

export default function PrivacyScreen() {
  return (
    <InformationPage
      title="Privacy policy"
      intro="How Choose One handles your information."
      sections={[
        { title: "Information we store", body: "We store the name, email address, and optional profile picture supplied through your sign-in provider. We also store the choices, lists, and profile details you create so the app can work across sessions." },
        { title: "How we use it", body: "We use this information only to provide, secure, and improve Choose One. We do not sell personal information or use it for advertising." },
        { title: "Sharing and security", body: "Your information is processed by the services that operate Choose One, including our authentication and database providers. Data is sent using encrypted connections." },
        { title: "Your choices", body: "You can edit your profile in the app. You can permanently delete your account and associated choices from Profile > Delete account. Deletion removes your account, authentication records, and app content." },
      ]}
    />
  );
}
