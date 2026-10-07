import { Component, type ReactNode } from "react";
import { AgentErrorNotice } from "./AgentResultSections";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches unexpected rendering errors inside a single agent's result panel
 * and shows a friendly inline notice instead of letting the error bubble up
 * to the app's root error boundary (which would blank the whole page).
 * Resets automatically the next time the agent is run again.
 */
export class AgentErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    console.error("[agent result render error]", error);
  }

  override componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <AgentErrorNotice
          title="Something went wrong while showing this result"
          message="The agent produced a result we couldn't display. Please try running the analysis again."
        />
      );
    }
    return this.props.children;
  }
}
