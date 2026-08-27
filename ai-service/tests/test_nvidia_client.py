import pytest
from unittest.mock import MagicMock, patch
from app.llm.client import NVIDIAClient

@patch("app.llm.client.OpenAI")
def test_nvidia_client_timeout(mock_openai_class):
    """Verify that client timeout propagates as an exception."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("Connection timed out")

    client = NVIDIAClient()
    with pytest.raises(Exception, match="Connection timed out"):
        client.generate_report("system", "user")

@patch("app.llm.client.OpenAI")
def test_nvidia_client_rate_limit(mock_openai_class):
    """Verify that client rate limit errors propagate as exceptions."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("Rate limit exceeded")

    client = NVIDIAClient()
    with pytest.raises(Exception, match="Rate limit exceeded"):
        client.generate_report("system", "user")
