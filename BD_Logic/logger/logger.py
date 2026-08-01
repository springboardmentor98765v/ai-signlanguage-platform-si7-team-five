import logging

logging.basicConfig(
    filenmae="business_logic.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("business_logic")