import { Skeleton, Stack, keyframes, styled } from '@mui/material'; 

// Define keyframes for the bouncing animation
const bounceAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.5); }
  100% { transform: scale(1); }
`;

// Create a styled component using the Skeleton component with the defined animation
const BouncingSkeleton = styled(Skeleton)`
  animation: ${bounceAnimation} 1s infinite;
`;

// Define a component for a loading animation resembling typing indicator
const TypingLoader = () => {
  return (
    // Use Stack component for arranging Skeleton components horizontally
    <Stack
      spacing={"0.5rem"}
      direction={"row"}
      padding={"0.5rem"}
      justifyContent={"center"}
    >
      {/* Render four circular Skeleton components with different animation delays */}
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.1s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.2s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.4s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.6s",
        }}
      />
    </Stack>
  );
};

// Export the TypingLoader component
export { TypingLoader };
