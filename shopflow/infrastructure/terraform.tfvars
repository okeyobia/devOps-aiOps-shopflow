region   = "us-east-2"
vpc_name = "shopflow-vpc"
vpc_cidr = "10.2.0.0/16"

subnets = [
  {
    name              = "subnet-1"
    cidr_block        = "10.2.1.0/24"
    availability_zone = "us-east-2a"
  },
  {
    name              = "subnet-2"
    cidr_block        = "10.2.2.0/24"
    availability_zone = "us-east-2b"
  },
  {
    name              = "subnet-3"
    cidr_block        = "10.2.3.0/24"
    availability_zone = "us-east-2c"
  }
]

cluster_name    = "shopflow-eks-cluster"
node_group_name = "shopflow-node-group"

instance_types = ["t3.medium"]
capacity_type  = "ON_DEMAND"

desired_size = 2
min_size     = 1
max_size     = 3

disk_size = 20

repositories = [
  "shopflow/frontend",
  "shopflow/gateway",
  "shopflow/auth",
  "shopflow/product-service",
  "shopflow/order-service",
  "shopflow/user-service"
]
