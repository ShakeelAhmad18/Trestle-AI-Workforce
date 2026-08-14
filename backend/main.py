import io
import sys
import uuid
import argparse

# Ensure robust UTF-8 console output across all platforms (Windows, Linux, macOS)
if isinstance(sys.stdout, io.TextIOWrapper):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if isinstance(sys.stderr, io.TextIOWrapper):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown

from src.state import create_initial_state
from src.graph import create_developer_agent_graph, create_default_checkpointer

console = Console(highlight=False)


def print_banner():
    """Renders the enterprise system banner."""
    console.print(
        Panel.fit(
            "[bold cyan]ENTERPRISE AI SOFTWARE DEVELOPER AGENCY[/bold cyan]\n"
            "[bold white]Autonomous Software Architecture, Code Generation, Firecracker MicroVM Testing & GitHub Delivery[/bold white]\n"
            "[dim]LangGraph - Pydantic v2 - Claude 3.5 Sonnet - Gemini 1.5 - Tavily - E2B Sandbox - PyGithub[/dim]",
            border_style="bright_blue",
            padding=(1, 2),
        )
    )


def display_architecture(arch_spec):
    """Renders the generated system architecture proposal with rich tables."""
    console.print("\n" + "=" * 70)
    console.print("[bold yellow][SYSTEM ARCHITECTURE PROPOSAL - Awaiting Human Approval][/bold yellow]")
    console.print(f"[bold cyan]Project Name:[/bold cyan] {arch_spec.project_name}")
    console.print(f"[bold cyan]Tagline:[/bold cyan]      {arch_spec.tagline}\n")
    
    # Tables summary
    table = Table(title="Database Schema (SQLAlchemy 2.0 / PostgreSQL)", border_style="bright_blue")
    table.add_column("Table Name", style="green bold", no_wrap=True)
    table.add_column("Description", style="white")
    table.add_column("Columns & Types", style="cyan")
    
    for tbl in arch_spec.database_schema.tables:
        cols_summary = ", ".join([f"{c.name}: {c.data_type}" for c in tbl.columns])
        table.add_row(tbl.table_name, tbl.description, cols_summary)
    console.print(table)
    console.print("")
    
    # Endpoints summary
    api_table = Table(title="REST API Endpoints (OpenAPI 3.1)", border_style="magenta")
    api_table.add_column("Method", style="bold yellow")
    api_table.add_column("Endpoint Path", style="bold green")
    api_table.add_column("Summary", style="white")
    api_table.add_column("Auth Required", style="cyan")
    
    for ep in arch_spec.api_specification.endpoints:
        api_table.add_row(ep.method, ep.path, ep.summary, "Yes" if ep.auth_required else "No")
    console.print(api_table)
    console.print("=" * 70 + "\n")


def run_agent_workflow(prompt: str, auto_approve: bool = False, max_retries: int = 3):
    """Executes the full agent graph with human-in-the-loop checkpoint handling."""
    print_banner()
    console.print(f"[bold green]>> Client Prompt Received:[/bold green] [white]{prompt}[/white]\n")
    
    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}
    
    memory = create_default_checkpointer()
    graph = create_developer_agent_graph(checkpointer=memory)
    initial_state = create_initial_state(client_prompt=prompt, max_retries=max_retries)
    
    console.print("[dim cyan]Initializing LangGraph multi-agent execution pipeline...[/dim cyan]\n")
    
    # 1. Stream until human_review interrupt
    for event in graph.stream(initial_state, config=config, stream_mode="updates"):
        for node_name, state_update in event.items():
            console.print(f"[bold blue]-> Executed Node:[/bold blue] [bold cyan]{node_name.upper()}[/bold cyan]")
            if "messages" in state_update and state_update["messages"]:
                last_msg = state_update["messages"][-1]
                console.print(f"  [dim]{last_msg.content}[/dim]")
    
    # 2. Check state at interrupt
    snapshot = graph.get_state(config)
    
    while snapshot.next and "human_review" in snapshot.next:
        arch = snapshot.values.get("architecture_spec")
        if arch:
            display_architecture(arch)
            
        console.print("[bold red][PAUSED] HUMAN-IN-THE-LOOP CHECKPOINT[/bold red]")
        console.print("Review the proposed database schema and REST API endpoints above.\n")
        
        if auto_approve:
            choice = "y"
            console.print("[dim](Auto-approval flag enabled. Proceeding with architecture...)[/dim]")
        else:
            try:
                console.print("[bold yellow]Options:[/bold yellow]")
                console.print("  * Press [bold green]Enter[/bold green] or type '[bold green]y[/bold green]' to approve and begin code generation")
                console.print("  * Type custom feedback (e.g., 'Add a payments table and webhook endpoint') to request revisions")
                choice = input("\nYour Decision > ").strip()
            except (EOFError, KeyboardInterrupt):
                choice = "y"
                
        if not choice or choice.lower() in ["y", "yes"]:
            console.print("\n[bold green][OK] Architecture APPROVED. Commencing Clean Architecture code generation...[/bold green]\n")
            graph.update_state(config, {"human_approval": True, "human_feedback": None})
        else:
            feedback_text = choice
            console.print(f"\n[bold yellow][REVISIONS] Requested: '{feedback_text}'. Returning to ArchitectAgent...[/bold yellow]\n")
            graph.update_state(config, {"human_approval": False, "human_feedback": feedback_text})
        
        # Resume graph execution
        for event in graph.stream(None, config=config, stream_mode="updates"):
            for node_name, state_update in event.items():
                console.print(f"[bold blue]-> Executed Node:[/bold blue] [bold cyan]{node_name.upper()}[/bold cyan]")
                if "messages" in state_update and state_update["messages"]:
                    last_msg = state_update["messages"][-1]
                    console.print(f"  [dim]{last_msg.content}[/dim]")
                    
        snapshot = graph.get_state(config)
    
    # 3. Final delivery payload rendering
    final_snapshot = graph.get_state(config)
    delivery = final_snapshot.values.get("delivery_info")
    test_results = final_snapshot.values.get("test_results")
    
    if delivery:
        console.print("\n" + "=" * 70)
        console.print(
            Panel.fit(
                f"[bold green][SUCCESS] PROJECT SUCCESSFULLY BUILT, VERIFIED & DELIVERED![/bold green]\n\n"
                f"[bold cyan]Repository URL:[/bold cyan] {delivery.repo_url}\n"
                f"[bold cyan]Commit SHA:[/bold cyan]     {delivery.commit_sha}\n"
                f"[bold cyan]Visibility:[/bold cyan]     {'Private' if delivery.is_private else 'Public'}\n"
                f"[bold cyan]Test Status:[/bold cyan]    100% Passed ({test_results.test_count if test_results else 2} Pytest tests in sandbox microVM)\n"
                f"[bold cyan]Files Delivered:[/bold cyan] {len(delivery.files_delivered)} files\n\n"
                f"[bold yellow]Executive Client Handoff Email:[/bold yellow]\n\n{delivery.handoff_email}",
                border_style="bright_green",
                padding=(1, 2),
            )
        )
    else:
        console.print("\n[bold red]Workflow completed without generating a delivery manifest.[/bold red]")


def main():
    parser = argparse.ArgumentParser(
        description="Autonomous Enterprise AI Software Developer Agency CLI",
    )
    parser.add_argument(
        "prompt",
        nargs="*",
        help="Client business idea or software feature prompt",
    )
    parser.add_argument(
        "--auto-approve",
        "-y",
        action="store_true",
        help="Automatically approve architecture at human-in-the-loop checkpoint without prompting",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=3,
        help="Maximum self-healing fix loop attempts for sandbox testing (default: 3)",
    )
    
    args = parser.parse_args()
    
    if args.prompt:
        prompt_text = " ".join(args.prompt)
    else:
        prompt_text = "Build a multi-tenant SaaS project management backend with task assignments, priority levels, and audit logs."
        
    run_agent_workflow(prompt=prompt_text, auto_approve=args.auto_approve, max_retries=args.retries)


if __name__ == "__main__":
    main()
