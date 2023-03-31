import { useSpring } from "@react-spring/web";
import {
  ContainerStepTitle,
  Dot,
  DotAnimated,
  DotCenter1,
  DotCenter2,
  DotFinal,
  HeaderStepsLine,
  Line,
  SmallDot,
  TitleStep,
} from "./HeaderSteps.style";

type HeaderStepsProps = {
  step: number;
};

export function HeaderSteps({ step }: HeaderStepsProps): JSX.Element {
  const springStepStart = useSpring({
    width: step === 0 ? "0%" : "100%",
  });

  const springStepBasic = useSpring({
    width: step > 1 ? "100%" : "0%",
  });

  const springStepTwo = useSpring({
    width: step > 2 ? "100%" : "0%",
  });

  const springStepSocialMedia = useSpring({
    width: step > 3 ? "100%" : "0%",
  });

  const springStepDot = useSpring({
    left:
      step === 0
        ? "calc(0% - 0px)"
        : step === 1
        ? "calc(33% - 8px)"
        : step === 2
        ? "calc(66% - 8px)"
        : "calc(100% - 8px)",
  });

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ContainerStepTitle>
          <Line style={springStepStart} />
          <TitleStep>Start</TitleStep>
        </ContainerStepTitle>
        <ContainerStepTitle>
          <Line style={springStepBasic} />
          <TitleStep>Basics</TitleStep>
        </ContainerStepTitle>

        <ContainerStepTitle>
          <Line style={springStepTwo} />
          <TitleStep>Details</TitleStep>
        </ContainerStepTitle>
        <ContainerStepTitle>
          <Line style={springStepSocialMedia} />
          <TitleStep>Social Media</TitleStep>
        </ContainerStepTitle>
      </div>
      <div
        style={{
          width: "calc(100% - 48px)",
          height: "25px",
          display: "flex",
          justifyContent: "center",
          margin: "0px 40px 0px 8px",
        }}
      >
        <HeaderStepsLine>
          <Dot>
           
            <SmallDot />
          </Dot>
          <DotCenter1>
            {
                step > 1 ? <SmallDot /> : null
            }
          </DotCenter1>
          <DotCenter2>
          {
                step > 2 ? <SmallDot /> : null
            }
          </DotCenter2>
          <DotFinal>
          {
                step > 3 ? <SmallDot /> : null
            }
          </DotFinal>
          <DotAnimated style={springStepDot}>
            <SmallDot />
          </DotAnimated>
        </HeaderStepsLine>
      </div>
    </div>
  );
}
