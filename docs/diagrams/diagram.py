# diagram.py
import os

from diagrams import Diagram, Edge
from diagrams.firebase.develop import Firestore, Functions
from diagrams.generic.device import Mobile

print("Prerequisits: https://diagrams.mingrammer.com/docs/getting-started/installation \n" \
  "   brew install graphviz\n" \
  "   pip install diagrams\n" \
  "\n" \
)

print("Generating Images: ", os.getcwd(), "\n\n")

with Diagram("My App", show=False, outformat="png", filename="MyApp"):
    Mobile("Client") \
      >> Edge(label="update request") \
      >> Functions("endpoint") \
      >> Edge(label="update data") \
      >> Firestore("user")
